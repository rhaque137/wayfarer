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
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for `/api/save-trip`)
  - (optional client aliases) `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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

## Notes

This repo includes working scaffolds for the required integrations; some provider APIs (Viator/Uber/Skyscanner) require account-specific endpoints and OAuth flows. Those routes are implemented as thin proxies and are ready to be finalized once your provider accounts/hosts are confirmed.

