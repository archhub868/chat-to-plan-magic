import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSessions, deleteSession } from "@/lib/tasks.functions";
import { checkIsAdmin } from "@/lib/admin.functions";
import { useReminderNotifications } from "@/lib/use-reminder-notifications";
import {
  Plus,
  ListTodo,
  Sparkles,
  LogOut,
  MessageSquareText,
  Trash2,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const fetchSessions = useServerFn(listSessions);
  const delSession = useServerFn(deleteSession);
  const fetchIsAdmin = useServerFn(checkIsAdmin);
  const { data: sessions } = useQuery({ queryKey: ["sessions"], queryFn: () => fetchSessions() });
  const { data: adminCheck } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => fetchIsAdmin(),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  async function remove(id: string) {
    if (!confirm("Delete this session and its tasks?")) return;
    await delSession({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["sessions"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    router.navigate({ to: "/app" });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">Planpaste</span>
          </Link>
        </div>

        <div className="px-3">
          <Link
            to="/app"
            className="flex w-full items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> New paste
          </Link>
          <Link
            to="/tasks"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ListTodo className="size-4" /> All tasks
          </Link>
          <Link
            to="/settings"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="size-4" /> Settings
          </Link>
          {adminCheck?.isAdmin && (
            <Link
              to="/admin"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Shield className="size-4" /> Admin
            </Link>
          )}
        </div>

        <div className="mt-6 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sessions
        </div>
        <nav className="mt-2 flex-1 overflow-y-auto px-2 pb-3">
          {sessions && sessions.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No sessions yet.</p>
          )}
          {sessions?.map((s) => (
            <div key={s.id} className="group flex items-center gap-1">
              <Link
                to="/sessions/$sessionId"
                params={{ sessionId: s.id }}
                activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
                className="flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <MessageSquareText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{s.title}</span>
              </Link>
              <button
                onClick={() => remove(s.id)}
                className="hidden size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive group-hover:flex"
                aria-label="Delete session"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Button onClick={signOut} variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
