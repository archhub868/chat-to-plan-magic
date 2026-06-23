import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  MessageSquare,
  BarChart3,
  Database,
  Star,
  Trash2,
  Inbox,
} from "lucide-react";
import {
  checkIsAdmin,
  adminListUsers,
  adminDeleteUser,
  adminSetUserBan,
  adminListReviews,
  adminDeleteReview,
  adminGetStats,
  adminListSessions,
  adminListTasks,
  adminListMessages,
  adminUpdateMessageStatus,
  adminDeleteMessage,
} from "@/lib/admin.functions";


export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const result = await checkIsAdmin();
    if (!result.isAdmin) throw redirect({ to: "/app" });
  },
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
          <Shield className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage users, reviews, and data.</p>
        </div>
      </div>

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-1.5 size-4" /> Stats
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-1.5 size-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="mr-1.5 size-4" /> Reviews
          </TabsTrigger>
          <TabsTrigger value="messages">
            <Inbox className="mr-1.5 size-4" /> Messages
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="mr-1.5 size-4" /> Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-4">
          <StatsPanel />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersPanel />
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <ReviewsPanel />
        </TabsContent>
        <TabsContent value="messages" className="mt-4">
          <MessagesPanel />
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <DataPanel />
        </TabsContent>

      </Tabs>
    </div>
  );
}

function StatsPanel() {
  const fetchStats = useServerFn(adminGetStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchStats(),
  });
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const items = [
    { label: "Total users", value: data.totalUsers },
    { label: "Active users (7d)", value: data.activeUsers7d },
    { label: "Chats processed", value: data.chatsProcessed },
    { label: "Tasks extracted", value: data.tasksExtracted },
    { label: "Tasks completed", value: data.tasksDone },
    { label: "Reviews", value: `${data.totalReviews} (${data.avgRating || "—"}★)` },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <Card key={i.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{i.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{i.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersPanel() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(adminListUsers);
  const delUser = useServerFn(adminDeleteUser);
  const banUser = useServerFn(adminSetUserBan);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsers(),
  });
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Permanently delete this user and all their data?")) return;
    setBusy(id);
    try {
      await delUser({ data: { userId: id } });
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }
  async function toggleBan(id: string, banned: boolean) {
    setBusy(id);
    try {
      await banUser({ data: { userId: id, banned: !banned } });
      toast.success(!banned ? "User deactivated" : "User reactivated");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((u) => {
              const banned = !!u.banned_until && new Date(u.banned_until) > new Date();
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    {u.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">user</span>
                    ) : (
                      u.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="mr-1">
                          {r}
                        </Badge>
                      ))
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(u.created_at), "PP")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "PP") : "—"}
                  </TableCell>
                  <TableCell>
                    {banned ? (
                      <Badge variant="destructive">Deactivated</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === u.id}
                      onClick={() => toggleBan(u.id, banned)}
                    >
                      {banned ? "Reactivate" : "Deactivate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy === u.id}
                      onClick={() => remove(u.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReviewsPanel() {
  const qc = useQueryClient();
  const fetchReviews = useServerFn(adminListReviews);
  const delReview = useServerFn(adminDeleteReview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => fetchReviews(),
  });

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await delReview({ data: { id } });
    toast.success("Review deleted");
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>;

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.display_name}</span>
                <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(r.created_at), "PPp")}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
              <Trash2 className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DataPanel() {
  const fetchSessions = useServerFn(adminListSessions);
  const fetchTasks = useServerFn(adminListTasks);
  const sessions = useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: () => fetchSessions(),
  });
  const tasks = useQuery({ queryKey: ["admin", "tasks"], queryFn: () => fetchTasks() });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4" /> Recent sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sessions.data ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="max-w-[200px] truncate">{s.title}</TableCell>
                  <TableCell className="font-mono text-xs">{s.user_id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(s.created_at), "PP")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4" /> Recent tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Done</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tasks.data ?? []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="max-w-[200px] truncate">{t.title}</TableCell>
                  <TableCell className="font-mono text-xs">{t.user_id.slice(0, 8)}…</TableCell>
                  <TableCell>{t.done ? "✓" : ""}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(t.created_at), "PP")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
