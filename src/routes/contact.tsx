import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Mail, MessageCircle, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Planpaste" },
      {
        name: "description",
        content:
          "Get in touch with the Planpaste team. Send feedback, report a bug, or share a feature request.",
      },
      { property: "og:title", content: "Contact — Planpaste" },
      { property: "og:description", content: "Get in touch with the Planpaste team." },
      { property: "og:url", content: "https://chat-to-plan-magic.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://chat-to-plan-magic.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Thanks! We'll get back to you soon.");
    }, 600);
  }

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
      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-24 md:grid-cols-[1fr_320px]">
        <section>
          <h1 className="text-4xl font-semibold tracking-tight">Contact us</h1>
          <p className="mt-3 text-muted-foreground">
            Questions, feedback, or feature ideas — we read every message.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={6}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </section>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <Mail className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">hello@planpaste.app</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <MessageCircle className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">Support</h3>
            <p className="mt-1 text-sm text-muted-foreground">Replies within 1 business day.</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <Twitter className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">Social</h3>
            <p className="mt-1 text-sm text-muted-foreground">@planpaste</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
