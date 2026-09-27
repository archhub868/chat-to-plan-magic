import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Planpaste" },
      {
        name: "description",
        content:
          "Planpaste Privacy Policy detailing how user data, chat transcripts, and Google account information are processed and protected.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 27, 2026</p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Welcome to <strong className="text-foreground">Planpaste</strong>. We respect your privacy and are committed to protecting the personal data you share with us when using our web application located at <strong className="text-foreground">https://magicplan.world</strong>.
          </p>

          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account Data:</strong> When you sign in via Google OAuth or email, we collect your name, email address, and profile picture provided by your authentication provider.
            </li>
            <li>
              <strong className="text-foreground">Chat Transcripts & Content:</strong> We process the text transcripts you paste to extract actionable tasks, action items, and deadlines.
            </li>
            <li>
              <strong className="text-foreground">Generated Tasks & Reviews:</strong> We store the extracted tasks, sessions, reminders, and community reviews you choose to create within the app.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>To authenticate your user session and securely present your saved plans and tasks.</li>
            <li>To extract tasks, commitments, and deadlines from user-submitted text using AI processing.</li>
            <li>To store reminders and display user reviews on our community page.</li>
            <li>We do not sell, rent, or trade your personal information or chat data to third parties.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">3. Data Storage & Third-Party Services</h2>
          <p>
            Your account and task data are stored securely using Supabase. Text parsing is processed via secure API calls to AI language models. All communication occurs over encrypted HTTPS channels.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. User Data Control & Deletion</h2>
          <p>
            You may delete your sessions, tasks, and reviews at any time through the Planpaste interface. You can also request complete account deletion by contacting us.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please contact us at:{" "}
            <a href="mailto:hello@magicplan.world" className="text-primary underline">
              hello@magicplan.world
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
}
