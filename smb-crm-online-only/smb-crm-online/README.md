# SMB CRM (Online-only) — Next.js + Supabase + Google + OpenAI

Single-user online CRM starter:
- **Vercel** (serverless hosting)
- **Supabase** (managed Postgres + Google sign-in)
- **Gmail label sync** (label: `Leads`) + Calendar sync
- **OpenAI copilot + app-owned memory** (`memory_items`)

## 1) Supabase
1. Create a Supabase project
2. Run:
   - `supabase/schema.sql`
   - `supabase/rpc.sql`
3. Enable Auth → **Google**
4. Add redirect URL:
   - `https://YOUR-APP.vercel.app/api/auth/oauth-callback`

### Seed Default Pipeline
After first sign-in, copy your Supabase Auth user id and run `supabase/seed.sql` (replace placeholders).

## 2) Google Cloud
Enable APIs:
- Gmail API
- Google Calendar API

OAuth client (Web app) redirect:
- `https://YOUR-APP.vercel.app/api/google/callback`

## 3) Vercel
Deploy and set env vars from `.env.example`.

### Cron
`vercel.json` adds cron schedules that call:
- `POST /api/sync/gmail`
- `POST /api/sync/calendar`

For MVP, cron endpoints accept browser cookie auth (single user). For production, lock cron down using `CRON_SECRET` or switch to Pub/Sub webhooks.

## What happens on Gmail sync
- Pulls recent messages with label `Leads`
- Auto-creates: Contact + Company (domain-based) + Deal in stage `New` (if needed)
- Logs EMAIL activities linked to the deal

