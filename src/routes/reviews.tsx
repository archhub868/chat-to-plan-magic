import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Star } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Planpaste" },
      { name: "description", content: "See what teams are saying about Planpaste — the fastest way to turn chats into action plans." },
      { property: "og:title", content: "Reviews — Planpaste" },
      { property: "og:description", content: "See what teams are saying about Planpaste." },
    ],
  }),
  component: ReviewsPage,
});

const reviews = [
  { name: "Maya R.", role: "Product Manager", stars: 5, text: "I used to scroll Slack for an hour after every standup. Now I paste the thread and it's done in 10 seconds." },
  { name: "Daniel K.", role: "Founder", stars: 5, text: "The deadline extraction is shockingly good. It even caught a 'next Friday' commitment I missed." },
  { name: "Priya S.", role: "Operations Lead", stars: 4, text: "Sharing the cleaned-up plan with my team has saved us so much follow-up. Wish it had Notion export." },
  { name: "Tomás L.", role: "Designer", stars: 5, text: "Finally something that respects how messy real conversations are. Feels magical." },
  { name: "Aisha M.", role: "Engineering Manager", stars: 5, text: "We pipe meeting transcripts in and get a clean action list. Replaced three notetaking tools." },
  { name: "Jordan W.", role: "Consultant", stars: 4, text: "Reliable, fast, and the reminders actually fire on time." },
];

function ReviewsPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Planpaste</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Home
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight">Loved by busy teams</h1>
        <p className="mt-3 text-muted-foreground">
          Real reviews from real users. Average rating: 4.8 / 5.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <article key={r.name} className="rounded-xl border border-border bg-card/50 p-5">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-4 ${i < r.stars ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <p className="mt-3 text-sm">{r.text}</p>
              <div className="mt-4 text-sm">
                <div className="font-medium">{r.name}</div>
                <div className="text-muted-foreground">{r.role}</div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
