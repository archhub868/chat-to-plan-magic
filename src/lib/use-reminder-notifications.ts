import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listReminders, listTasks } from "@/lib/tasks.functions";

const FIRED_KEY = "planpaste.fired-reminders";

function getFired(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function markFired(key: string) {
  const s = getFired();
  s.add(key);
  localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(s).slice(-500)));
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied");
  }
  if (Notification.permission !== "default") return Promise.resolve(Notification.permission);
  return Notification.requestPermission();
}

/**
 * Schedules browser notifications for all upcoming reminders while the app is
 * open. Falls back silently when the browser blocks notifications.
 */
export function useReminderNotifications() {
  const fetchReminders = useServerFn(listReminders);
  const fetchTasks = useServerFn(listTasks);
  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => fetchReminders(),
  });
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: () => fetchTasks() });

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!reminders || reminders.length === 0) return;

    const titleByTask = new Map((tasks ?? []).map((t) => [t.id, t.title]));
    const timers: number[] = [];
    const fired = getFired();
    const now = Date.now();

    for (const r of reminders) {
      const at = new Date(r.remind_at).getTime();
      if (Number.isNaN(at)) continue;
      const key = `${r.task_id}:${r.remind_at}`;
      if (fired.has(key)) continue;
      const delay = at - now;
      if (delay < -60_000) continue; // more than a minute stale
      const fire = () => {
        try {
          if (Notification.permission === "granted") {
            new Notification("Reminder", {
              body: titleByTask.get(r.task_id) ?? "Task reminder",
              tag: key,
            });
          }
        } catch {
          /* ignore */
        }
        markFired(key);
      };
      if (delay <= 0) fire();
      else timers.push(window.setTimeout(fire, Math.min(delay, 2_147_000_000)));
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, [reminders, tasks]);
}
