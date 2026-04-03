import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import { asArray, asString, isRecord } from "@/lib/guards";
import { TripDashboard } from "@/components/dashboard/TripDashboard";

export const runtime = "nodejs";

export default async function TripWorkspace({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = getSupabaseAnonServerClient();
  const { data } = supabase
    ? await supabase.from("trips").select("id, public_id, spec").eq("id", tripId).maybeSingle()
    : { data: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spec = (data as any)?.spec ?? null;
  const destination =
    isRecord(spec) && asArray(spec["destinations"])?.length
      ? (asString((asArray(spec["destinations"]) ?? [])[0]) ?? "Your destination")
      : "Your destination";

  return (
    <TripDashboard tripId={tripId} destination={destination} initialSpec={spec} />
  );
}
