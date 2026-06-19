import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { extractTasks, saveSession } from "@/lib/tasks.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Trash2, Loader2, Calendar, User, Quote, Upload } from "lucide-react";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 50000;

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
  if (isPdf) {
    const pdfjs = await import("pdfjs-dist");
    // Use a worker from the same package via Vite's ?url import
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let out = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      out +=
        content.items
          .map((it: unknown) => (it as { str?: string }).str ?? "")
          .join(" ") + "\n\n";
    }
    return out.trim();
  }
  // Treat anything else as plain text (txt, md, csv, json, exported chat logs, etc.)
  return await file.text();
}

type Draft = {
  title: string;
  details: string | null;
  assignee: string | null;
  said_by: string | null;
  deadline: string | null;
};

export const Route = createFileRoute("/_authenticated/app")({
  component: PastePage,
});

function PastePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const extract = useServerFn(extractTasks);
  const save = useServerFn(saveSession);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File is too large (max 10 MB).");
      return;
    }
    setUploading(true);
    try {
      const extracted = await extractTextFromFile(file);
      if (!extracted.trim()) {
        toast.error("Couldn't read any text from that file.");
        return;
      }
      const truncated = extracted.slice(0, MAX_TEXT_CHARS);
      setText(truncated);
      if (extracted.length > MAX_TEXT_CHARS) {
        toast.message(`File truncated to ${MAX_TEXT_CHARS.toLocaleString()} characters.`);
      } else {
        toast.success(`Loaded ${file.name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onExtract() {
    if (!text.trim()) return;
    setExtracting(true);
    try {
      const result = await extract({ data: { text } });
      setTitle(result.title);
      setDrafts(
        result.tasks.map((t) => ({
          title: t.title,
          details: t.details ?? null,
          assignee: t.assignee ?? null,
          said_by: t.said_by ?? null,
          deadline: t.deadline ?? null,
        })),
      );
      if (result.tasks.length === 0) toast.message("No action items found in that chat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function onSave() {
    if (!drafts) return;
    setSaving(true);
    try {
      const { sessionId } = await save({
        data: { title: title || "Untitled chat", source_text: text, tasks: drafts },
      });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Plan saved");
      navigate({ to: "/sessions/$sessionId", params: { sessionId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function update(i: number, patch: Partial<Draft>) {
    setDrafts((d) => d?.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) ?? null);
  }
  function remove(i: number) {
    setDrafts((d) => d?.filter((_, idx) => idx !== i) ?? null);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">New paste</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop in a chat thread — WhatsApp, Slack, email, anything.
        </p>
      </div>

      {!drafts ? (
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste your chat here…\n\nAlice: We need the proposal by Friday.\nBob: I'll handle the budget section.\nAlice: Great — and book the venue for the 22nd.`}
            className="min-h-[320px] resize-y font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length.toLocaleString()} chars
            </span>
            <Button onClick={onExtract} disabled={!text.trim() || extracting} size="lg">
              {extracting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Extracting…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" /> Extract action plan
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <Label htmlFor="title">Plan title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-medium">
                  {drafts.length} task{drafts.length === 1 ? "" : "s"} found
                </h2>
                <p className="text-xs text-muted-foreground">Edit anything before saving.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  update(drafts.length, {
                    title: "New task",
                    details: null,
                    assignee: null,
                    said_by: null,
                    deadline: null,
                  })
                }
              >
                + Add task
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {drafts.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No tasks. Add one or re-extract.
                </li>
              )}
              {drafts.map((t, i) => (
                <li key={i} className="space-y-2 px-4 py-4">
                  <div className="flex gap-2">
                    <Input
                      value={t.title}
                      onChange={(e) => update(i, { title: e.target.value })}
                      className="font-medium"
                    />
                    <button
                      onClick={() => remove(i)}
                      className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {t.details !== null && (
                    <Textarea
                      value={t.details ?? ""}
                      onChange={(e) => update(i, { details: e.target.value || null })}
                      className="min-h-[60px] text-sm"
                      placeholder="Details"
                    />
                  )}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                      <Input
                        value={t.assignee ?? ""}
                        onChange={(e) => update(i, { assignee: e.target.value || null })}
                        placeholder="Assignee"
                        className="pl-8 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Quote className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                      <Input
                        value={t.said_by ?? ""}
                        onChange={(e) => update(i, { said_by: e.target.value || null })}
                        placeholder="Said by"
                        className="pl-8 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        value={toLocalInput(t.deadline)}
                        onChange={(e) =>
                          update(i, {
                            deadline: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          })
                        }
                        className="pl-8 text-sm"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setDrafts(null)}>
              ← Back to paste
            </Button>
            <Button onClick={onSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}
