import { google } from "googleapis";
import { supabaseService } from "../supabaseServer";
import { getAuthedGoogle } from "../googleClient";

export async function syncCalendarForUser(userId: string) {
  const sb = supabaseService();
  const auth = await getAuthedGoogle(userId);
  const cal = google.calendar({ version: "v3", auth });

  const now = new Date();
  const list = await cal.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    maxResults: 30,
    singleEvents: true,
    orderBy: "startTime"
  });

  const events = list.data.items || [];
  let synced = 0;

  for (const e of events) {
    if (!e.id) continue;
    const { data: existing } = await sb.from("activities").select("id").eq("external_id", e.id).limit(1);
    if (existing && existing.length) continue;

    const start = e.start?.dateTime || e.start?.date;
    const occurredAt = start ? new Date(start).toISOString() : new Date().toISOString();

    await sb.from("activities").insert({
      user_id: userId, type: "MEETING", subject: e.summary || "Meeting",
      body: e.description || "", external_id: e.id, occurred_at: occurredAt
    });

    // Simple automation: recap task for meetings today
    const sameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
    if (start && sameDay(new Date(start), now)) {
      await sb.from("tasks").insert({
        user_id: userId,
        title: `Send recap: ${e.summary || "Meeting"}`,
        due_date: new Date(Date.now()+2*60*60*1000).toISOString()
      });
    }

    synced++;
  }

  return synced;
}
