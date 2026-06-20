import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Planpaste" },
      {
        name: "description",
        content:
          "Planpaste turns messy chats into clean action plans. Learn about our mission and how we extract tasks from conversations.",
      },
      { property: "og:title", content: "About — Planpaste" },
      {
        property: "og:description",
        content: "Planpaste turns messy chats into clean action plans.",
      },
      { property: "og:url", content: "https://chat-to-plan-magic.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://chat-to-plan-magic.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Planpaste</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight">About Planpaste</h1>
        <p className="mt-4 text-muted-foreground">
          Planpaste was built for people drowning in group chats, threads, and meeting notes. We
          believe the best ideas usually get lost in conversation — not because they aren't
          captured, but because nothing turns them into action.
        </p>
        <h2 className="mt-10 text-2xl font-semibold tracking-tight">Our mission</h2>
        <p className="mt-3 text-muted-foreground">
          Make every conversation count. Paste any chat — from Slack, WhatsApp, iMessage, email —
          and walk away with a clean, shareable plan of who owes what, by when.
        </p>
        <h2 className="mt-10 text-2xl font-semibold tracking-tight">How it works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Paste the conversation into Planpaste.</li>
          <li>Our AI extracts every task, deadline, and commitment.</li>
          <li>Edit, schedule reminders, and share with the group.</li>
        </ul>
      </main>
    </div>
  );
}
