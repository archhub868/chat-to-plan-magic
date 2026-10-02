import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function logAndThrow(scope: string, error: unknown, userMessage: string): never {
  console.error(`[${scope}]`, error);
  throw new Error(userMessage);
}

export const extractTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1).max(50000) }).parse(input))
  .handler(async ({ data }) => {
    const { runExtraction } = await import("./tasks.server");
    return runExtraction(data);
  });

export const extractTasksTrial = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ text: z.string().min(1).max(20000), visitorId: z.string().min(8).max(100) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const enc = new TextEncoder();
    const hash = async (v: string) =>
      Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(v))))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const ipHash = "ip:" + (await hash(ip));
    const visitorHash = "v:" + (await hash(data.visitorId));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("trial_parses")
      .select("visitor_hash")
      .in("visitor_hash", [ipHash, visitorHash]);
    if (existing && existing.length > 0) {
      return { limitReached: true as const, title: "", tasks: [] };
    }
    await supabaseAdmin
      .from("trial_parses")
      .upsert([{ visitor_hash: ipHash }, { visitor_hash: visitorHash }]);
    const { runExtraction } = await import("./tasks.server");
    const result = await runExtraction(data);
    return { limitReached: false as const, ...result };
  });

export const saveSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1).max(200),
        source_text: z.string().min(1).max(50000),
        tasks: z
          .array(
            z.object({
              title: z.string().min(1).max(500),
              details: z.string().max(5000).nullable().optional(),
              assignee: z.string().max(200).nullable().optional(),
              said_by: z.string().max(200).nullable().optional(),
              deadline: z.string().max(64).nullable().optional(),
            }),
          )
          .max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({ user_id: userId, title: data.title, source_text: data.source_text })
      .select()
      .single();
    if (error || !session) logAndThrow("saveSession", error, "Failed to create session");

    if (data.tasks.length > 0) {
      const rows = data.tasks.map((t) => ({
        user_id: userId,
        session_id: session!.id,
        title: t.title,
        details: t.details ?? null,
        assignee: t.assignee ?? null,
        said_by: t.said_by ?? null,
        deadline: t.deadline ? new Date(t.deadline).toISOString() : null,
      }));
      const { error: tErr } = await supabase.from("tasks").insert(rows);
      if (tErr) logAndThrow("saveSession.tasks", tErr, "Failed to save tasks");
    }
    return { sessionId: session!.id };
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sessions")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    if (error) logAndThrow("listSessions", error, "Failed to load sessions");
    return data ?? [];
  });

export const getSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: session, error } = await context.supabase
      .from("sessions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) logAndThrow("getSession", error, "Failed to load session");
    if (!session) return null;
    const { data: tasks } = await context.supabase
      .from("tasks")
      .select("*")
      .eq("session_id", data.id)
      .order("created_at", { ascending: true });
    return { session, tasks: tasks ?? [] };
  });

export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tasks")
      .select("*, sessions(title)")
      .order("deadline", { ascending: true, nullsFirst: false });
    if (error) logAndThrow("listTasks", error, "Failed to load tasks");
    return data ?? [];
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        details: z.string().max(5000).nullable().optional(),
        assignee: z.string().max(200).nullable().optional(),
        said_by: z.string().max(200).nullable().optional(),
        deadline: z.string().max(64).nullable().optional(),
        done: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("tasks").update(patch).eq("id", id);
    if (error) logAndThrow("updateTask", error, "Failed to update task");
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    if (error) logAndThrow("deleteTask", error, "Failed to delete task");
    return { ok: true };
  });

export const deleteSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sessions").delete().eq("id", data.id);
    if (error) logAndThrow("deleteSession", error, "Failed to delete session");
    return { ok: true };
  });

export const upsertReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ task_id: z.string().uuid(), remind_at: z.string() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("reminders").delete().eq("task_id", data.task_id);
    const { error } = await context.supabase.from("reminders").insert({
      user_id: context.userId,
      task_id: data.task_id,
      remind_at: new Date(data.remind_at).toISOString(),
    });
    if (error) logAndThrow("upsertReminder", error, "Failed to save reminder");
    return { ok: true };
  });

export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("reminders").select("task_id, remind_at");
    if (error) logAndThrow("listReminders", error, "Failed to load reminders");
    return data ?? [];
  });
