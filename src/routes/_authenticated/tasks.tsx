import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTasks, listReminders } from "@/lib/tasks.functions";
import { useMemo, useState } from "react";
import { format, isPast, isToday, isThisWeek } from "date-fns";
import { TaskRow } from "./sessions.$sessionId";
import { ListTodo } from "lucide-react";

type Filter = "all" | "today" | "week" | "overdue" | "no-date" | "done";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const qc = useQueryClient();
  const fetchTasks = useServerFn(listTasks);
  const fetchReminders = useServerFn(listReminders);
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: () => fetchTasks() });
  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => fetchReminders(),
  });
  const reminderByTask = new Map((reminders ?? []).map((r) => [r.task_id, r.remind_at]));

  const [filter, setFilter] = useState<Filter>("all");
  const [person, setPerson] = useState<string>("all");

  const people = useMemo(() => {
    const s = new Set<string>();
    tasks?.forEach((t) => t.assignee && s.add(t.assignee));
    return Array.from(s).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = tasks ?? [];
    if (person !== "all") list = list.filter((t) => t.assignee === person);
    list = list.filter((t) => {
      if (filter === "all") return !t.done;
      if (filter === "done") return t.done;
      if (filter === "no-date") return !t.deadline && !t.done;
      if (!t.deadline || t.done) return false;
      const d = new Date(t.deadline);
      if (filter === "today") return isToday(d);
      if (filter === "week") return isThisWeek(d, { weekStartsOn: 1 });
      if (filter === "overdue") return isPast(d) && !isToday(d);
      return true;
    });
    return list;
  }, [tasks, filter, person]);

  // Group by session for "by source chat"
  const groups = useMemo(() => {
    const m = new Map<
      string,
      { title: string; sessionId: string | null; items: typeof filtered }
    >();
    for (const t of filtered) {
      const key = t.session_id ?? "none";
      const title =
        (t as unknown as { sessions?: { title?: string } | null }).sessions?.title ??
        "No session";

      const existing = m.get(key);
      if (existing) existing.items.push(t);
      else m.set(key, { title, sessionId: t.session_id, items: [t] });
    }
    return Array.from(m.values());
  }, [filtered]);

  const counts = {
    all: tasks?.filter((t) => !t.done).length ?? 0,
    today: tasks?.filter((t) => !t.done && t.deadline && isToday(new Date(t.deadline))).length ?? 0,
    week:
      tasks?.filter(
        (t) => !t.done && t.deadline && isThisWeek(new Date(t.deadline), { weekStartsOn: 1 }),
      ).length ?? 0,
    overdue:
      tasks?.filter(
        (t) =>
          !t.done && t.deadline && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)),
      ).length ?? 0,
    "no-date": tasks?.filter((t) => !t.done && !t.deadline).length ?? 0,
    done: tasks?.filter((t) => t.done).length ?? 0,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <ListTodo className="size-5 text-primary" />
        <h1 className="text-3xl font-semibold tracking-tight">All tasks</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "today", "week", "overdue", "no-date", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filter === f
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {labelFor(f)} <span className="ml-1 opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {people.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Person:</span>
          <button
            onClick={() => setPerson("all")}
            className={`rounded-full px-3 py-1 ${person === "all" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Everyone
          </button>
          {people.map((p) => (
            <button
              key={p}
              onClick={() => setPerson(p)}
              className={`rounded-full px-3 py-1 ${person === p ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/30 p-10 text-center text-sm text-muted-foreground">
          Nothing here.{" "}
          <Link to="/app" className="text-primary hover:underline">
            Paste a chat
          </Link>{" "}
          to get started.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.sessionId ?? "none"}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {g.title}
                </h2>
                {g.sessionId && (
                  <Link
                    to="/sessions/$sessionId"
                    params={{ sessionId: g.sessionId }}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Open session →
                  </Link>
                )}
              </div>
              <ul className="space-y-2">
                {g.items.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    reminder={reminderByTask.get(t.id) ?? null}
                    onChange={() => {
                      qc.invalidateQueries({ queryKey: ["tasks"] });
                      qc.invalidateQueries({ queryKey: ["reminders"] });
                    }}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function labelFor(f: Filter) {
  return {
    all: "Open",
    today: "Today",
    week: "This week",
    overdue: "Overdue",
    "no-date": "No date",
    done: "Done",
  }[f];
}
