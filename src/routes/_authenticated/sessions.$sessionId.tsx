import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSession,
  updateTask,
  deleteTask,
  upsertReminder,
  listReminders,
} from "@/lib/tasks.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import {
  Bell,
  Copy,
  Calendar as CalIcon,
  Download,
  Trash2,
  User,
  Quote,
  ChevronLeft,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/_authenticated/sessions/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const qc = useQueryClient();
  const fetchSession = useServerFn(getSession);
  const fetchReminders = useServerFn(listReminders);

  const { data, isLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession({ data: { id: sessionId } }),
  });
  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => fetchReminders(),
  });
  const reminderByTask = new Map((reminders ?? []).map((r) => [r.task_id, r.remind_at]));

  if (isLoading) return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  if (!data) return <div className="p-10 text-sm text-muted-foreground">Session not found.</div>;

  const tasks = data.tasks;

  function exportMarkdown() {
    const md =
      `# ${data!.session.title}\n\n` +
      tasks
        .map((t) => {
          const meta = [
            t.assignee ? `**${t.assignee}**` : null,
            t.deadline ? `📅 ${format(new Date(t.deadline), "PP p")}` : null,
            t.said_by ? `_via ${t.said_by}_` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return `- [${t.done ? "x" : " "}] ${t.title}${meta ? `\n  ${meta}` : ""}${t.details ? `\n  ${t.details}` : ""}`;
        })
        .join("\n");
    navigator.clipboard.writeText(md);
    toast.success("Markdown copied to clipboard");
  }

  function exportIcs() {
    const events = tasks.filter((t) => t.deadline);
    if (events.length === 0) {
      toast.message("No tasks have deadlines yet.");
      return;
    }
    const ics = buildIcs(data!.session.title, events);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data!.session.title.replace(/\s+/g, "_")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        to="/app"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3" /> Back
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{data.session.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {format(new Date(data.session.created_at), "PP")} · {tasks.length} task
            {tasks.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportMarkdown} variant="outline" size="sm">
            <Copy className="mr-2 size-4" /> Markdown
          </Button>
          <Button onClick={exportIcs} variant="outline" size="sm">
            <Download className="mr-2 size-4" /> .ics
          </Button>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            reminder={reminderByTask.get(t.id) ?? null}
            onChange={() => {
              qc.invalidateQueries({ queryKey: ["session", sessionId] });
              qc.invalidateQueries({ queryKey: ["tasks"] });
              qc.invalidateQueries({ queryKey: ["reminders"] });
            }}
          />
        ))}
      </ul>

      <details className="mt-10 rounded-lg border border-border bg-card/50 p-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground">Original chat</summary>
        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
          {data.session.source_text}
        </pre>
      </details>
    </div>
  );
}

export function TaskRow({
  task,
  reminder,
  onChange,
}: {
  task: {
    id: string;
    title: string;
    details: string | null;
    assignee: string | null;
    said_by: string | null;
    deadline: string | null;
    done: boolean;
  };
  reminder: string | null;
  onChange: () => void;
}) {
  const upd = useServerFn(updateTask);
  const del = useServerFn(deleteTask);
  const setReminder = useServerFn(upsertReminder);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [remind, setRemind] = useState(reminder ?? "");

  async function toggleDone(v: boolean) {
    await upd({ data: { id: task.id, done: v } });
    onChange();
  }
  async function saveTitle() {
    if (title !== task.title) {
      await upd({ data: { id: task.id, title } });
      onChange();
    }
    setEditing(false);
  }
  async function remove() {
    if (!confirm("Delete this task?")) return;
    await del({ data: { id: task.id } });
    toast.success("Deleted");
    onChange();
  }
  async function saveReminder() {
    if (!remind) return;
    await setReminder({ data: { task_id: task.id, remind_at: new Date(remind).toISOString() } });
    toast.success("Reminder set");
    onChange();
  }

  return (
    <li className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.done}
          onCheckedChange={(v) => toggleDone(Boolean(v))}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              className="h-7"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className={`block text-left text-sm font-medium ${task.done ? "text-muted-foreground line-through" : ""}`}
            >
              {task.title}
            </button>
          )}
          {task.details && <p className="mt-1 text-xs text-muted-foreground">{task.details}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {task.assignee && (
              <span className="inline-flex items-center gap-1">
                <User className="size-3" /> {task.assignee}
              </span>
            )}
            {task.said_by && (
              <span className="inline-flex items-center gap-1">
                <Quote className="size-3" /> {task.said_by}
              </span>
            )}
            {task.deadline && (
              <span className="inline-flex items-center gap-1">
                <CalIcon className="size-3" /> {format(new Date(task.deadline), "PP p")}
              </span>
            )}
            {reminder && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Bell className="size-3" /> {format(new Date(reminder), "PP p")}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="Set reminder"
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              >
                <Bell className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <p className="mb-2 text-xs font-medium">Remind me at</p>
              <Input
                type="datetime-local"
                value={toLocalInput(remind)}
                onChange={(e) =>
                  setRemind(e.target.value ? new Date(e.target.value).toISOString() : "")
                }
              />
              <Button onClick={saveReminder} size="sm" className="mt-2 w-full">
                Set reminder
              </Button>
            </PopoverContent>
          </Popover>
          <button
            onClick={remove}
            aria-label="Delete task"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

function buildIcs(
  calendarName: string,
  events: Array<{ id: string; title: string; details: string | null; deadline: string | null }>,
) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      "00Z"
    );
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Planpaste//EN",
    `X-WR-CALNAME:${calendarName}`,
  ];
  for (const e of events) {
    if (!e.deadline) continue;
    const start = fmt(e.deadline);
    const end = fmt(new Date(new Date(e.deadline).getTime() + 30 * 60_000).toISOString());
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@planpaste`,
      `DTSTAMP:${fmt(new Date().toISOString())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcs(e.title)}`,
      e.details ? `DESCRIPTION:${escapeIcs(e.details)}` : "",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
function escapeIcs(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
