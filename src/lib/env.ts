import { z } from "zod";

const serverSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),

  ACCUWEATHER_API_KEY: z.string().min(1).optional(),
  AMADEUS_CLIENT_ID: z.string().min(1).optional(),
  AMADEUS_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_PLACES_API_KEY: z.string().min(1).optional(),
  UBER_CLIENT_ID: z.string().min(1).optional(),
  UBER_CLIENT_SECRET: z.string().min(1).optional(),
  UNSPLASH_ACCESS_KEY: z.string().min(1).optional(),
  RAPIDAPI_KEY: z.string().min(1).optional(),
  VIATOR_API_KEY: z.string().min(1).optional(),
  ROME2RIO_API_KEY: z.string().min(1).optional(),
  FOURSQUARE_API_KEY: z.string().min(1).optional(),
  NUMBEO_API_KEY: z.string().min(1).optional(),
  EXCHANGERATE_API_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export const env = {
  server: serverSchema.parse(process.env),
  client: clientSchema.parse(process.env),
};
