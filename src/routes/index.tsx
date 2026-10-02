import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, ListChecks, Bell, Share2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Planpaste — Turn chats into action plans" },
      { name: "description", content: "Turn chat threads into editable tasks, deadlines, and reminders with Planpaste." },
      { property: "og:title", content: "Planpaste — Turn chats into action plans" },
      { property: "og:description", content: "Turn chat threads into editable tasks, deadlines, and reminders with Planpaste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
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
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      <div>
        {/* Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">Planpaste</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>

          <nav
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute left-0 top-16 w-full flex-col items-center gap-4 bg-background/95 p-6 backdrop-blur md:static md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:bg-transparent md:p-0`}
            onClick={() => setMenuOpen(false)}
          >
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link to="/reviews" className="text-sm text-muted-foreground hover:text-foreground">
              Reviews
            </Link>
            <Link to="/guides/whatsapp-tasks" className="text-sm text-muted-foreground hover:text-foreground">
              WhatsApp guide
            </Link>
            <Link to="/guides/meeting-notes" className="text-sm text-muted-foreground hover:text-foreground">
              Meeting notes guide
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>

            <Link
              to={isAuthed ? "/app" : "/auth"}
              className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium hover:bg-accent"
            >
              {isAuthed ? "Open app" : "Sign in"}
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 text-center md:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" /> AI that reads your chats
          </div>

          <h1 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Turn messy chats into a{" "}
            <span className="text-primary">clean action plan</span>.
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-balance text-sm text-muted-foreground sm:text-base">
            Paste a thread from anywhere. Get every task, deadline, and who-said-what — ready to edit, remind, and share.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to={isAuthed ? "/app" : "/try"}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {isAuthed ? "Open app" : "Try it free"} <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-24 text-center">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What Planpaste does</h2>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-border/80 bg-card/40 p-6">
                <ListChecks className="size-5 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Extract</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Tasks, deadlines, commitments — auto-tagged by who said it.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/40 p-6">
                <Bell className="size-5 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Remind</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Pick a date and time. We'll nudge you when it matters.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/40 p-6">
                <Share2 className="size-5 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Share</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Export as markdown, calendar (.ics), or a clean group plan.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded bg-primary/15 text-primary">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Planpaste</span>
            <span className="ml-1 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Planpaste. All rights reserved.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">
              About
            </Link>
            <Link to="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link to="/reviews" className="hover:text-foreground">
              Reviews
            </Link>
            <Link to="/guides/whatsapp-tasks" className="hover:text-foreground">
              WhatsApp guide
            </Link>
            <Link to="/guides/meeting-notes" className="hover:text-foreground">
              Meeting notes guide
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link to="/privacy" className="font-medium text-foreground hover:text-primary">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
