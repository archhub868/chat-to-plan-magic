import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, ClipboardPaste, ListChecks, Bell, Share2 } from "lucide-react";

const URL = "https://chat-to-plan-magic.lovable.app/guides/whatsapp-tasks";

export const Route = createFileRoute("/guides/whatsapp-tasks")({
  head: () => ({
    meta: [
      { title: "WhatsApp Task Extractor: Turn Group Chats Into Action Plans" },
      {
        name: "description",
        content:
          "How to pull tasks, owners, and deadlines out of a WhatsApp group chat: export or copy the thread, paste it into Planpaste, and get a clean, shareable action plan.",
      },
      { property: "og:title", content: "WhatsApp Task Extractor: Turn Group Chats Into Plans" },
      {
        property: "og:description",
        content:
          "Export or copy a WhatsApp thread, paste it into Planpaste, and get tasks, owners, and deadlines you can edit and share.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "WhatsApp Task Extractor — Planpaste" },
      {
        name: "twitter:description",
        content: "Turn messy WhatsApp group chats into a clean action plan.",
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
              headline: "WhatsApp Task Extractor: Turn Group Chats Into Action Plans",
              description:
                "How to pull tasks, owners, and deadlines out of a WhatsApp group chat using Planpaste.",
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
                  name: "WhatsApp task extractor",
                  item: URL,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: WhatsappGuidePage,
});

const steps = [
  {
    icon: ClipboardPaste,
    title: "1. Get the conversation out of WhatsApp",
    body: "On mobile, open the group, tap the group name, and choose Export chat → Without media. That gives you a .txt file. For a shorter thread, press and hold the first message, select the rest, and tap Copy.",
  },
  {
    icon: ListChecks,
    title: "2. Paste it into Planpaste",
    body: "Drop the text (or upload the exported .txt) into the paste box. Planpaste reads the WhatsApp timestamp-and-sender format and extracts every task, who committed to it, and any date mentioned — including relative ones like \u201cby Friday\u201d.",
  },
  {
    icon: Bell,
    title: "3. Edit, assign, and set reminders",
    body: "Review the extracted list before saving. Delete the small talk, fix an owner, then set a per-task reminder with a date and time so nothing quietly slips.",
  },
  {
    icon: Share2,
    title: "4. Share the plan back to the group",
    body: "Copy the plan as Markdown or export it to your calendar, then paste it back into the same WhatsApp group so everyone sees the same list.",
  },
];

function WhatsappGuidePage() {
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
          How to extract tasks from a WhatsApp group chat
        </h1>
        <p className="mt-4 text-muted-foreground">
          WhatsApp groups are where plans actually get made — and where they get lost. Decisions sit
          between memes, someone says &ldquo;I&rsquo;ll handle the venue&rdquo; on Tuesday, and by
          the weekend nobody remembers who owns what. This guide shows how to turn a messy thread
          into a clean action plan in a couple of minutes.
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
          What a WhatsApp thread looks like before and after
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <h3 className="text-sm font-medium">Pasted in</h3>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {`[10:12] Amina: can we lock the venue this week?
[10:13] Dan: I'll call them tomorrow morning
[10:15] Amina: cool. I'll do the invites by Friday
[10:16] Priya: budget sheet is on me, Monday latest`}
            </pre>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <h3 className="text-sm font-medium">Extracted plan</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Call the venue — Dan — tomorrow morning</li>
              <li>Send invites — Amina — by Friday</li>
              <li>Prepare budget sheet — Priya — Monday</li>
            </ul>
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          How this differs from a meeting recorder
        </h2>
        <p className="mt-3 text-muted-foreground">
          AI note takers and meeting recorders such as Otter.ai listen to live calls and produce a
          transcript summary. WhatsApp coordination isn&rsquo;t a call — it&rsquo;s written text
          spread over days, across many people, mixed with everything else. Planpaste works on the
          text you already have: no bot to invite, no recording, no meeting required. You paste,
          it extracts commitments, and you keep an editable plan you can share back to the group.
        </p>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Common questions</h2>
        <dl className="mt-4 space-y-5 text-sm">
          <div>
            <dt className="font-medium">Does it work with the exported .txt file?</dt>
            <dd className="mt-1 text-muted-foreground">
              Yes. Upload the export, or paste the text directly — both are handled the same way.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Do relative deadlines work?</dt>
            <dd className="mt-1 text-muted-foreground">
              Phrases like &ldquo;tomorrow&rdquo;, &ldquo;by Friday&rdquo;, or &ldquo;next
              week&rdquo; are turned into concrete dates you can adjust before saving.
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
          <h2 className="text-lg font-semibold tracking-tight">Try it with your own group chat</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a thread and see the plan it produces.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/try"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Paste a chat
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              How Planpaste works
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
