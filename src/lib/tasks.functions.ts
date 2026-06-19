import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ExtractedTask = z.object({
  title: z.string(),
  details: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  said_by: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
});

const ExtractedPlan = z.object({
  title: z.string().min(1).default("Untitled chat"),
  tasks: z.array(ExtractedTask).default([]),
});

function parseExtractedPlan(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI response did not contain a JSON object");
  }
  return ExtractedPlan.parse(JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)));
}

function logAndThrow(scope: string, error: unknown, userMessage: string): never {
  console.error(`[${scope}]`, error);
  throw new Error(userMessage);
}

export const extractTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1).max(50000) }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      console.error("[extractTasks] AI gateway not configured");
      throw new Error("AI extraction is unavailable");
    }

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const now = new Date().toISOString();
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      temperature: 0,
      maxOutputTokens: 4096,
      prompt: `You extract actionable tasks, deadlines, and commitments from chat transcripts.

Return only valid JSON, with no markdown fences or commentary. Shape:
{"title":"short 3-7 word summary","tasks":[{"title":"task","details":null,"assignee":null,"said_by":null,"deadline":null}]}

Current datetime (ISO): ${now}

Rules:
- Only include real action items, commitments, or decisions (not small talk).
- "title": short imperative phrase ("Send Q3 report").
- "details": optional one-sentence context.
- "assignee": person who must do it (name as written in the chat, or "me").
- "said_by": who originally said/committed to it.
- "deadline": ISO 8601 timestamp if a date/time is clearly stated or strongly implied (resolve relative like "tomorrow" / "Friday" using the current datetime above). Otherwise null.
- Return [] if there are no real tasks.

Chat transcript:
"""
${data.text}
"""`,
    });

    try {
      return parseExtractedPlan(text);
    } catch (error) {
      console.error("Failed to parse extraction response", error);
      return { title: "Untitled chat", tasks: [] };
    }
  });

export const saveSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1).max(200),
        source_text: z.string().min(1),
        tasks: z.array(
          z.object({
            title: z.string().min(1),
            details: z.string().nullable().optional(),
            assignee: z.string().nullable().optional(),
            said_by: z.string().nullable().optional(),
            deadline: z.string().nullable().optional(),
          }),
        ),
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
        title: z.string().min(1).optional(),
        details: z.string().nullable().optional(),
        assignee: z.string().nullable().optional(),
        said_by: z.string().nullable().optional(),
        deadline: z.string().nullable().optional(),
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
