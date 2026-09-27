import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, ListChecks, Bell, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Planpaste — Turn chats into action plans" },
    { name: "description", content: "Turn chat threads into editable tasks, deadlines, and reminders with Planpaste." },
    { property: "og:title", content: "Planpaste — Turn chats into action plans" },
    { property: "og:description", content: "Turn chat threads into editable tasks, deadlines, and reminders with Planpaste." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Landing,
});

function Landing() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen">
       <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Planpaste</span>
        </div>
         <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
           {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
         </Button>
         <nav className={`${menuOpen ? "flex" : "hidden"} col-span-2 flex-col items-stretch gap-1 border-t border-border pt-3 text-sm md:col-span-1 md:flex md:flex-row md:items-center md:border-0 md:pt-0`} onClick={() => setMenuOpen(false)}>
          <Link
            to="/about"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/reviews"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Reviews
          </Link>
          <Link
            to="/guides/whatsapp-tasks"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            WhatsApp guide
          </Link>
          <Link
            to="/contact"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Contact
          </Link>

          <Link
            to={isAuthed ? "/app" : "/auth"}
             className="rounded-md border border-border px-4 py-2 font-medium hover:bg-accent md:ml-2"
          >
            {isAuthed ? "Open app" : "Sign in"}
          </Link>
        </nav>
      </header>

       <main className="mx-auto max-w-3xl px-4 pt-10 pb-24 text-center sm:px-6 md:pt-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> AI that reads your chats
        </span>
         <h1 className="mt-6 text-balance text-4xl font-semibold sm:text-5xl md:text-6xl">
          Turn messy chats into a{" "}
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            clean action plan
          </span>
          .
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
          Paste a thread from anywhere. Get every task, deadline, and who-said-what — ready to edit,
          remind, and share.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to={isAuthed ? "/app" : "/auth"}
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isAuthed ? "Open app" : "Start free"}{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <h2 className="mt-20 text-2xl font-semibold tracking-tight">What Planpaste does</h2>
        <div className="mt-6 grid gap-4 text-left md:grid-cols-3">
          {[
            {
              icon: ListChecks,
              t: "Extract",
              d: "Tasks, deadlines, commitments — auto-tagged by who said it.",
            },
            {
              icon: Bell,
              t: "Remind",
              d: "Pick a date and time. We'll nudge you when it matters.",
            },
            {
              icon: Share2,
              t: "Share",
              d: "Export as markdown, calendar (.ics), or a clean group plan.",
            },
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
