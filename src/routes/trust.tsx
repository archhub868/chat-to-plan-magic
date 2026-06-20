import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock, Database, UserCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Security — Planpaste" },
      {
        name: "description",
        content:
          "How Planpaste handles security, privacy, and your data. Authentication, row-level security, and platform controls.",
      },
      { property: "og:title", content: "Trust & Security — Planpaste" },
      {
        property: "og:description",
        content: "How Planpaste handles security, privacy, and your data.",
      },
      { property: "og:url", content: "https://chat-to-plan-magic.lovable.app/trust" },
    ],
    links: [{ rel: "canonical", href: "https://chat-to-plan-magic.lovable.app/trust" }],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          ← Planpaste
        </Link>
        <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Shield className="size-5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Trust & Security</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This page is maintained by the Planpaste team to answer common security and privacy
            questions about Planpaste. It describes the controls currently in place; it is not an
            independent certification or audit.
          </p>
        </div>

        <Section icon={<UserCheck className="size-4" />} title="Authentication & access">
          <ul className="ml-5 list-disc space-y-1">
            <li>Accounts are protected with email/password or Google sign-in.</li>
            <li>
              Sessions are managed by our authentication provider with short-lived access tokens.
            </li>
            <li>Every request to your data is authorized server-side as the signed-in user.</li>
          </ul>
        </Section>

        <Section icon={<Database className="size-4" />} title="Your data">
          <ul className="ml-5 list-disc space-y-1">
            <li>
              We store the chat text you paste, the tasks we extract from it, and any reminders you
              set.
            </li>
            <li>
              Row-level security policies on our database scope every row to the user who created
              it. Other users cannot read or modify your sessions, tasks, or reminders.
            </li>
            <li>
              You can delete any session, task, or reminder from the app, and the underlying records
              are removed.
            </li>
          </ul>
        </Section>

        <Section icon={<Lock className="size-4" />} title="Platform & hosting">
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Planpaste runs on Lovable Cloud. Traffic is served over HTTPS, and data at rest is
              encrypted by the underlying platform.
            </li>
            <li>
              AI extraction is performed via the Lovable AI Gateway; pasted text is sent to the
              model for the sole purpose of extracting tasks for you.
            </li>
            <li>Internal errors are logged server-side and not exposed to end users.</li>
          </ul>
        </Section>

        <Section icon={<Mail className="size-4" />} title="Reporting a security issue">
          <p>
            If you believe you've found a security issue, please email the Planpaste team. We aim to
            acknowledge reports promptly and will work with you on remediation.
          </p>
        </Section>

        <p className="mt-10 text-xs text-muted-foreground">
          This page reflects current app-level controls and is updated as the product evolves. It is
          not a certification or audit and does not create any contractual commitments.
        </p>
      </main>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-lg border border-border bg-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
