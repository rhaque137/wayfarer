export const runtime = "nodejs";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const foursquareVersion = process.env.FOURSQUARE_API_VERSION ?? "2025-06-17";

  return Response.json({
    success: true,
    openaiProxyUrl: `${origin}/api/openai-proxy`,
    foursquareProxyUrl: `${origin}/api/foursquare-proxy`,
    mapboxAccessToken: mapboxToken,
    foursquareVersion,
  });
}
