import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Account settings — Planpaste" },
      { name: "description", content: "Manage your Planpaste email, password, and session." },
      { property: "og:title", content: "Account settings — Planpaste" },
      { property: "og:description", content: "Manage your Planpaste email, password, and session." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentEmail(data.user?.email ?? "");
      setEmail(data.user?.email ?? "");
    });
  }, []);

  async function updateEmail() {
    if (!email || email === currentEmail) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your inbox to confirm the new email.");
  }

  async function updatePassword() {
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPassword("");
    toast.success("Password updated.");
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Account settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage your email, password, and session.
      </p>

       <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-medium">Email address</h2>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {currentEmail || "…"}.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <div className="mt-4">
          <Button onClick={updateEmail} disabled={busy || !email || email === currentEmail}>
            Update email
          </Button>
        </div>
      </section>

       <section className="mt-6 border-t border-border pt-6">
        <h2 className="font-medium">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use at least 8 characters.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <div className="mt-4">
          <Button onClick={updatePassword} disabled={busy || !password}>
            Update password
          </Button>
        </div>
      </section>

       <section className="mt-6 border-t border-border pt-6">
        <h2 className="font-medium">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign out of this device.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
