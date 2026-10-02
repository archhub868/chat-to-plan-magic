import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { extractTasksTrial } from "@/lib/tasks.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, Calendar, User, Quote, Lock } from "lucide-react";

export const TRIAL_DRAFT_KEY = "planpaste_trial_draft";
const TRIAL_USED_KEY = "planpaste_trial_used";
const VISITOR_KEY = "planpaste_visitor_id";

type Task = {
  title: string;
  details?: string | null;
  assignee?: string | null;
  said_by?: string | null;
  deadline?: string | null;
};

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "Try Planpaste free — no account needed" },
      {
        name: "description",
        content: "Paste a chat and see its action plan instantly. Your first parse needs no sign-up.",
      },
      { property: "og:title", content: "Try Planpaste free — no account needed" },
      {
        property: "og:description",
        content: "Paste a chat and see its action plan instantly. Your first parse needs no sign-up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TryPage,
});

function TryPage() {
  const extract = useServerFn(extractTasksTrial);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(false);
  const [result, setResult] = useState<{ title: string; tasks: Task[] } | null>(null);

  useEffect(() => {
    setUsed(localStorage.getItem(TRIAL_USED_KEY) === "1");
    const saved = localStorage.getItem(TRIAL_DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setResult(d.result);
        setText(d.text);
      } catch {
        /* ignore */
      }
    }
  }, []);

  async function onExtract() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      let visitorId = localStorage.getItem(VISITOR_KEY);
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitorId);
      }
      const res = await extract({ data: { text, visitorId } });
      localStorage.setItem(TRIAL_USED_KEY, "1");
      setUsed(true);
      if (res.limitReached) {
        toast.message("You've used your free parse. Create a free account to keep going.");
        return;
      }
      const r = { title: res.title, tasks: res.tasks };
      setResult(r);
      localStorage.setItem(TRIAL_DRAFT_KEY, JSON.stringify({ text, result: r }));
      if (r.tasks.length === 0) toast.message("No action items found in that chat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <Sparkles className="size-4 text-primary" /> Planpaste
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Try it free</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your first parse needs no account. Sign up free to save plans, set reminders, and parse more.
      </p>

      {result ? (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">{result.title}</h2>
          <ul className="space-y-3">
            {result.tasks.map((t, i) => (
              <li key={i} className="min-w-0 rounded-lg border border-border bg-card p-4">
                <p className="font-medium break-words">{t.title}</p>
                {t.details && <p className="mt-1 text-sm text-muted-foreground">{t.details}</p>}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {t.assignee && (
                    <span className="inline-flex items-center gap-1"><User className="size-3" />{t.assignee}</span>
                  )}
                  {t.said_by && (
                    <span className="inline-flex items-center gap-1"><Quote className="size-3" />{t.said_by}</span>
                  )}
                  {t.deadline && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(t.deadline).toLocaleString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <SignupCta text="Like it? Create a free account to save this plan, set reminders, and parse more chats." />
        </div>
      ) : used ? (
        <div className="mt-8">
          <SignupCta text="You've used your free parse. Create a free account to keep turning chats into plans." />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={20000}
            placeholder={`Paste your chat here…\n\nAlice: We need the proposal by Friday.\nBob: I'll handle the budget section.`}
            className="min-h-[280px] resize-y font-mono text-sm"
          />
          <Button onClick={onExtract} disabled={loading || !text.trim()} className="w-full sm:w-auto">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Extract tasks
          </Button>
        </div>
      )}
    </div>
  );
}

function SignupCta({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-primary/40 bg-card/60 p-5">
      <p className="flex items-start gap-2 text-sm">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
        {text}
      </p>
      <Button asChild className="mt-4">
        <Link to="/auth">Create free account</Link>
      </Button>
    </div>
  );
}
