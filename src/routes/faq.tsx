import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Planpaste" },
      {
        name: "description",
        content: "Find answers to common questions about Planpaste, chat extraction, privacy, and exports.",
      },
      { property: "og:title", content: "FAQ — Planpaste" },
      { property: "og:description", content: "Frequently asked questions about Planpaste." },
      { property: "og:url", content: "https://magicplan.world/faq" },
    ],
    links: [{ rel: "canonical", href: "https://magicplan.world/faq" }],
  }),
  component: FAQPage,
});

const FAQS = [
  {
    q: "How does Planpaste process my chat messages?",
    a: "Planpaste uses specialized AI models to scan the pasted chat transcript, extract actionable items (tasks, deadlines, assignees), and structure them into editable lists.",
  },
  {
    q: "Is my chat data kept private?",
    a: "Yes. Your chat inputs are processed strictly to generate your action plans and reminders. We do not sell your personal data or use private conversations to train public AI models.",
  },
  {
    q: "Which chat platforms are supported?",
    a: "You can copy and paste message threads from WhatsApp, Slack, Telegram, iMessage, Email, or plain text notes.",
  },
  {
    q: "Can I export my action plans?",
    a: "Yes! You can export your generated tasks as formatted Markdown, download calendar events (.ics files), or share a clean web summary link.",
  },
  {
    q: "How do reminders work?",
    a: "Once tasks with deadlines are extracted, you can schedule nudges so you or your team get notified at specified times.",
  },
  {
    q: "Is Planpaste free to use?",
    a: "We offer a free tier so you can start extracting action plans right away without entering payment details.",
  },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about Planpaste and how it turns conversations into clear plans.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-border/80 bg-card/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left font-medium text-foreground focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <Minus className="size-4 shrink-0 text-primary" />
                  ) : (
                    <Plus className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-border/40 px-5 pb-5 pt-3 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center rounded-2xl border border-border/60 bg-card/20 p-8">
          <h2 className="text-xl font-semibold">Have more questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Can't find the answer you're looking for? Reach out directly to our team.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
