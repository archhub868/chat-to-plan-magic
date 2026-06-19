import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, ListChecks, Bell, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Landing,
});

function Landing() {
  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Planpaste</span>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/about" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground">About</Link>
          <Link to="/reviews" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground">Reviews</Link>
          <Link to="/contact" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground">Contact</Link>
          <Link
            to="/auth"
            className="ml-2 rounded-md border border-border px-4 py-2 font-medium hover:bg-accent"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> AI that reads your chats
        </span>
        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-6xl">
          Turn messy chats into a{" "}
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            clean action plan
          </span>
          .
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
          Paste a thread from anywhere. Get every task, deadline, and who-said-what — ready to
          edit, remind, and share.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start free <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-20 grid gap-4 text-left md:grid-cols-3">
          {[
            { icon: ListChecks, t: "Extract", d: "Tasks, deadlines, commitments — auto-tagged by who said it." },
            { icon: Bell, t: "Remind", d: "Pick a date and time. We'll nudge you when it matters." },
            { icon: Share2, t: "Share", d: "Export as markdown, calendar (.ics), or a clean group plan." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-border bg-card/50 p-5">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-medium">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
