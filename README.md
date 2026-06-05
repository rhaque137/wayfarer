# Wayfarer

Wayfarer is a futuristic, full‑stack, AI‑powered travel planning web app (Next.js App Router + Supabase + OpenAI) designed as a “travel operating system”: plan, search, and guide trips with live integrations.

## Stack

- Frontend: Next.js 14 + TypeScript + Tailwind CSS (v4) + Framer Motion
- Backend: Next.js Route Handlers (`src/app/api/*`)
- AI: OpenAI Responses API (trip parsing + city intel) + Whisper transcription
- DB/Auth/Realtime: Supabase Postgres + Auth + Realtime
- Maps: Mapbox GL JS (`navigation-night-v1`)

## Local development

```bash
cd wayfarer
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` → `.env.local` and fill in keys.

- OpenAI
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (default: `gpt-4o`)
- Supabase
  - `NEXT_PUBLIC_SUPABASE_URL` (required for browser auth)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for browser auth)
  - `SUPABASE_URL` (optional server alias)
  - `SUPABASE_ANON_KEY` (optional server alias)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for privileged save/profile API routes)
- Maps / public
  - `NEXT_PUBLIC_MAPBOX_TOKEN`
  - `NEXT_PUBLIC_BASE_URL`
- Integrations (scaffolded proxies)
  - `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`
  - `GOOGLE_PLACES_API_KEY`
  - `FOURSQUARE_API_KEY`
  - `ROME2RIO_API_KEY`
  - `VIATOR_API_KEY` (+ optional `VIATOR_API_BASE_URL`)
  - `NUMBEO_API_KEY`
  - `EXCHANGERATE_API_KEY`
  - `RESEND_API_KEY`
  - `RAPIDAPI_KEY` (Skyscanner calendar wiring TBD)
  - `UNSPLASH_ACCESS_KEY` (destination hero photos wiring TBD)
  - `UBER_CLIENT_ID`, `UBER_CLIENT_SECRET` (estimates wiring TBD; deep-link works without OAuth)

## Supabase schema

Run the migration in `supabase/migrations/0001_wayfarer_init.sql` in your Supabase project.

- Tables: `trips`, `itinerary_items`, `collaborators`, `votes`
- RLS: public read‑only share links via `trips.is_public = true` (server writes use service role)

## Routes

- `/` Mission-control landing + Voice/Text “AI Trip Commander”
- `/plan/[tripId]` Itinerary workspace (drag/drop skeleton)
- `/plan/[tripId]/flights` Amadeus flight search
- `/plan/[tripId]/hotels` Amadeus hotel search + Mapbox map
- `/plan/[tripId]/city/[citySlug]` City How‑To Hub (OpenAI + web search)
- `/plan/[tripId]/budget` Numbeo + exchange rates proxy
- `/plan/[tripId]/packing` AI packing list generator
- `/trip/[publicId]` Read‑only public share view

## Deployment (Vercel)

- Set environment variables in Vercel project settings.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (server-only).
- Deploy as a standard Next.js App Router project.

## Supabase Auth Redirects

For Google OAuth and email recovery, configure these redirect URLs in Supabase Auth:

- Production: `https://wayfarer-ten.vercel.app/auth/callback`
- Local dev: `http://localhost:3000/auth/callback`

The callback route completes PKCE code exchange server-side, persists Supabase auth cookies, handles provider errors, creates or updates a `profiles` row for signed-in users, and redirects users to `/trips` by default.

## Supabase Google OAuth Setup

1. In Supabase, enable the Google provider under Auth Providers.
2. Add the Google OAuth client ID and secret from Google Cloud.
3. In Supabase Auth URL configuration, set the site URL to `https://wayfarer-ten.vercel.app`.
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://wayfarer-ten.vercel.app/auth/callback`
5. Add these Vercel and local environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Restart the local dev server after changing `.env.local`.

If the header shows `Sign in unavailable`, the public Supabase env vars are missing in Vercel or local `.env.local`.

## Notes

This repo includes working scaffolds for the required integrations; some provider APIs (Viator/Uber/Skyscanner) require account-specific endpoints and OAuth flows. Those routes are implemented as thin proxies and are ready to be finalized once your provider accounts/hosts are confirmed.
