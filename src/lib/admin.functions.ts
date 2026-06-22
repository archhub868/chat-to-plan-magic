import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userId: string;
}) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin access required");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error("Failed to list users");

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const rolesByUser = new Map<string, string[]>();
    (roles ?? []).forEach((r: { user_id: string; role: string }) => {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });

    return data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      banned_until: (u as unknown as { banned_until?: string | null }).banned_until ?? null,
      roles: rolesByUser.get(u.id) ?? [],
    }));
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error("Failed to delete user");
    return { ok: true };
  });

export const adminSetUserBan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), banned: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Cannot deactivate yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.banned ? "876000h" : "none",
    } as unknown as Parameters<typeof supabaseAdmin.auth.admin.updateUserById>[1]);
    if (error) throw new Error("Failed to update user");
    return { ok: true };
  });

export const adminListReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("reviews")
      .select("id, user_id, display_name, rating, body, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Failed to load reviews");
    return data ?? [];
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error("Failed to delete review");
    return { ok: true };
  });

export const adminGetStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [sessions, tasks, reviews] = await Promise.all([
      context.supabase.from("sessions").select("id, user_id, created_at"),
      context.supabase.from("tasks").select("id, done, created_at"),
      context.supabase.from("reviews").select("id, rating"),
    ]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const sessionsList = sessions.data ?? [];
    const tasksList = tasks.data ?? [];
    const activeUserIds = new Set(
      sessionsList
        .filter((s) => new Date(s.created_at).getTime() >= sevenDaysAgo)
        .map((s) => s.user_id),
    );
    const ratings = (reviews.data ?? []).map((r) => r.rating);
    const avgRating =
      ratings.length === 0 ? 0 : ratings.reduce((a, b) => a + b, 0) / ratings.length;

    return {
      totalUsers: usersData.users.length,
      activeUsers7d: activeUserIds.size,
      chatsProcessed: sessionsList.length,
      tasksExtracted: tasksList.length,
      tasksDone: tasksList.filter((t) => t.done).length,
      totalReviews: ratings.length,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  });

export const adminListSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("sessions")
      .select("id, user_id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Failed to load sessions");
    return data ?? [];
  });

export const adminListTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("tasks")
      .select("id, user_id, title, done, deadline, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Failed to load tasks");
    return data ?? [];
  });
