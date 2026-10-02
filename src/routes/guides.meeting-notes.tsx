import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, ClipboardPaste, ListChecks, Bell, Share2 } from "lucide-react";

const URL = "https://chat-to-plan-magic.lovable.app/guides/meeting-notes";

export const Route = createFileRoute("/guides/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes to Action Items: Turn Notes Into a Task List" },
      {
        name: "description",
        content:
          "How to turn meeting notes into action items: paste your notes into Planpaste and get owners, deadlines, and commitments as an editable, shareable task list.",
      },
      { property: "og:title", content: "Meeting Notes to Action Items — Planpaste" },
      {
        property: "og:description",
        content:
          "Paste meeting notes into Planpaste and get action items with owners and deadlines you can edit, remind, and share.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Meeting Notes to Action Items — Planpaste" },
      {
        name: "twitter:description",
        content: "Turn raw meeting notes into a clean action plan with owners and deadlines.",
      },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "Meeting Notes to Action Items: Turn Notes Into a Task List",
              description:
                "How to turn meeting notes into action items with owners and deadlines using Planpaste.",
              mainEntityOfPage: URL,
              author: { "@type": "Organization", name: "Planpaste" },
              publisher: { "@type": "Organization", name: "Planpaste" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://chat-to-plan-magic.lovable.app/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Meeting notes to action items",
                  item: URL,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: MeetingNotesGuidePage,
});

const steps = [
  {
    icon: ClipboardPaste,
    title: "1. Grab your notes from wherever they live",
    body: "Copy the notes from Google Docs, Notion, Apple Notes, an email follow-up, or the raw transcript from your call recorder. Planpaste works on plain text, so any format pastes cleanly — bullet points, headings, and all.",
  },
  {
    icon: ListChecks,
    title: "2. Paste them into Planpaste",
    body: "Drop the notes into the paste box. Planpaste reads through the discussion and pulls out every action item, who it was assigned to, and any date mentioned — including phrases like \u201cbefore the next sprint\u201d or \u201cEOD Thursday\u201d.",
  },
  {
    icon: Bell,
    title: "3. Review, assign, and set reminders",
    body: "Check the extracted list before saving. Remove the discussion points that aren\u2019t tasks, fix an owner if the notes were ambiguous, then set a per-task reminder with a date and time so follow-ups actually happen.",
  },
  {
    icon: Share2,
    title: "4. Send the plan back to the team",
    body: "Copy the plan as Markdown for your docs or Slack, or export it to your calendar as an .ics file. Everyone leaves with the same list of who does what by when.",
  },
];

function MeetingNotesGuidePage() {
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
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Guide</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          How to turn meeting notes into action items
        </h1>
        <p className="mt-4 text-muted-foreground">
          Meetings end, notes get filed, and the action items quietly disappear. The decisions are
          in there somewhere — buried between agenda items and half-finished sentences. This guide
          shows how to turn raw meeting notes into a clean task list with owners and deadlines in a
          couple of minutes.
        </p>

        <div className="mt-10 space-y-6">
          {steps.map((s) => (
            <section key={s.title} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
                  <s.icon className="size-4" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">{s.title}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          What meeting notes look like before and after
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <h3 className="text-sm font-medium">Pasted in</h3>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {`Sprint planning — Tues 14:00
- launch date moved to the 18th
- Sara to update the pricing page before launch
- Tom said he'll draft the announcement email by Thurs
- we still need QA signoff, Priya chasing it this week`}
            </pre>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <h3 className="text-sm font-medium">Extracted plan</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Update the pricing page — Sara — before the 18th</li>
              <li>Draft announcement email — Tom — by Thursday</li>
              <li>Get QA signoff — Priya — this week</li>
            </ul>
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          How this differs from an AI meeting recorder
        </h2>
        <p className="mt-3 text-muted-foreground">
          AI note takers such as Otter.ai join your call, record it, and produce a transcript
          summary. That works when everyone is happy having a bot in the meeting — but often you
          already have notes, or the meeting happened without one. Planpaste works on the text you
          already have: no bot to invite, no recording, no calendar integration required. You paste
          the notes, it extracts the commitments, and you keep an editable plan you can share back
          to the team.
        </p>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Common questions</h2>
        <dl className="mt-4 space-y-5 text-sm">
          <div>
            <dt className="font-medium">Does it work with transcripts from recorders?</dt>
            <dd className="mt-1 text-muted-foreground">
              Yes. Paste the raw transcript or the summary — Planpaste reads either and pulls out
              the action items.
            </dd>
          </div>
          <div>
            <dt className="font-medium">What if my notes don&rsquo;t name an owner?</dt>
            <dd className="mt-1 text-muted-foreground">
              The task is still extracted. You can assign an owner while reviewing, before saving
              the plan.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Do I need an account to try it?</dt>
            <dd className="mt-1 text-muted-foreground">
              You can run a first parse without signing up. An account is needed to save plans, set
              reminders, and come back to them later.
            </dd>
          </div>
        </dl>

        <div className="mt-12 rounded-xl border border-border bg-card/50 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Try it with your own notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste your last meeting&rsquo;s notes and see the plan it produces.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/try"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Paste your notes
            </Link>
            <Link
              to="/guides/whatsapp-tasks"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              WhatsApp guide
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
