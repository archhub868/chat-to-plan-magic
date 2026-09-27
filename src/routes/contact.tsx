import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Mail, MessageCircle, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
      { property: "og:url", content: "https://magicplan.world/contact" },
    ],
    links: [{ rel: "canonical", href: "https://magicplan.world/contact" }],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = contactSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSending(true);

    // Save to Supabase contact_messages table
    const { error } = await supabase.from("contact_messages").insert(parsed.data);

    setSending(false);

    if (error) {
      toast.error("Couldn't send message. Please try again.");
      return;
    }

    form.reset();
    toast.success("Thanks! We'll get back to you soon.");
  }

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
                name="name"
                required
                maxLength={100}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={255}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                required
                maxLength={200}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                maxLength={5000}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <Button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </section>

        <aside className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Other ways to reach us
          </h2>
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <Mail className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">Email</h3>
            <a
              href="mailto:planpaste@gmail.com"
              className="mt-1 text-sm text-muted-foreground hover:text-primary underline block"
            >
              planpaste@gmail.com
            </a>
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
