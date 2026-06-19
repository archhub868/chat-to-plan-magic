import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Planpaste" },
      {
        name: "description",
        content:
          "Read reviews from Planpaste users and share your own experience turning chats into action plans.",
      },
      { property: "og:title", content: "Reviews — Planpaste" },
      {
        property: "og:description",
        content: "Read reviews from Planpaste users and share your own.",
      },
    ],
  }),
  component: ReviewsPage,
});

type Review = {
  id: string;
  display_name: string;
  rating: number;
  body: string;
  created_at: string;
  user_id: string;
};

const reviewSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be under 80 characters"),
  rating: z.number().int().min(1).max(5),
  body: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Keep your review under 2000 characters"),
});

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, display_name, rating, body, created_at, user_id")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load reviews");
      setReviews([]);
      return;
    }
    setReviews(data ?? []);
  }

  useEffect(() => {
    loadReviews();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      const meta = (data.user?.user_metadata ?? {}) as { full_name?: string; name?: string };
      setName(meta.full_name || meta.name || data.user?.email?.split("@")[0] || "");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const alreadyReviewed = !!(user && reviews?.some((r) => r.user_id === user.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = reviewSchema.safeParse({ display_name: name, rating, body });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid review");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      display_name: parsed.data.display_name,
      rating: parsed.data.rating,
      body: parsed.data.body,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit review");
      return;
    }
    toast.success("Thanks for your review!");
    setBody("");
    setRating(5);
    loadReviews();
  }

  const avg =
    reviews && reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

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
      <main className="mx-auto max-w-5xl px-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight">Community reviews</h1>
        <p className="mt-3 text-muted-foreground">
          {avg
            ? `Average rating: ${avg} / 5 from ${reviews!.length} review${reviews!.length === 1 ? "" : "s"}.`
            : "Be the first to share your experience."}
        </p>

        <section className="mt-10 rounded-xl border border-border bg-card/50 p-6">
          <h2 className="text-lg font-semibold">Share your review</h2>
          {!user ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>{" "}
              to write a review about how Planpaste works for you.
            </p>
          ) : alreadyReviewed ? (
            <p className="mt-3 text-sm text-muted-foreground">
              You've already shared a review — thank you!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-name">Display name</Label>
                <Input
                  id="review-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    const active = val <= (hover || rating);
                    return (
                      <button
                        key={val}
                        type="button"
                        onMouseEnter={() => setHover(val)}
                        onClick={() => setRating(val)}
                        aria-label={`${val} star${val > 1 ? "s" : ""}`}
                        className="p-1 text-primary transition-transform hover:scale-110"
                      >
                        <Star className={`size-6 ${active ? "fill-current" : "opacity-30"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-body">Your experience</Label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="How has Planpaste worked for you? How was the interactivity?"
                  rows={5}
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-muted-foreground">{body.length} / 2000</p>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : "Submit review"}
              </Button>
            </form>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">What people are saying</h2>
          {reviews === null ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading reviews…
            </div>
          ) : reviews.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <article key={r.id} className="rounded-xl border border-border bg-card/50 p-5">
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < r.rating ? "fill-current" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{r.body}</p>
                  <div className="mt-4 text-sm">
                    <div className="font-medium">{r.display_name}</div>
                    <div className="text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
