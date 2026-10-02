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

export async function runExtraction(data: { text: string }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[extractTasks] OPENAI_API_KEY not configured");
      throw new Error("AI extraction is unavailable. Add OPENAI_API_KEY to Vercel.");
    }

    const now = new Date().toISOString();
    const prompt = `You extract actionable tasks, deadlines, and commitments from chat transcripts.

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
"""`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API error:", errorData);
        throw new Error("Failed to extract tasks from OpenAI");
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content || "";
      return parseExtractedPlan(text);
    } catch (error) {
      console.error("Failed to parse extraction response", error);
      return { title: "Untitled chat", tasks: [] };
    }
}
