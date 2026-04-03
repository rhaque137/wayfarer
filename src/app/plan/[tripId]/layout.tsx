import type { Metadata } from "next";
import { TripSidebar } from "@/components/shell/TripSidebar";
import { TripTopbar, type TripMeta } from "@/components/shell/TripTopbar";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import { asArray, asString, isRecord } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Wayfarer • Plan",
};

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = getSupabaseAnonServerClient();
  const { data } = supabase ? await supabase.from("trips").select("spec").eq("id", tripId).maybeSingle() : { data: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spec = (data as any)?.spec ?? null;

  const meta: TripMeta = (() => {
    const title = isRecord(spec) ? asString(spec["title"]) ?? `Trip ${tripId.slice(0, 6)}` : `Trip ${tripId.slice(0, 6)}`;
    const dest0 =
      isRecord(spec) && asArray(spec["destinations"])?.length ? asString((asArray(spec["destinations"]) ?? [])[0]) : null;
    const travelers = isRecord(spec) ? (typeof spec["travelers"] === "number" ? spec["travelers"] : null) : null;
    const budget = isRecord(spec) ? (typeof spec["budget"] === "number" ? spec["budget"] : null) : null;
    const currency = isRecord(spec) ? asString(spec["currency"]) : null;
    const month = isRecord(spec) ? asString(spec["month"]) : null;
    const days = isRecord(spec) && isRecord(spec["skeleton"]) && Array.isArray((spec["skeleton"] as Record<string, unknown>)["days"])
      ? (((spec["skeleton"] as Record<string, unknown>)["days"] as unknown[])?.length ?? null)
      : null;

    const chips = [
      dest0 ? dest0 : null,
      days ? `${days} days` : null,
      month ? month : null,
      travelers ? `${travelers} traveler${travelers === 1 ? "" : "s"}` : null,
      budget && currency ? `${currency} ${budget.toLocaleString()}` : null,
    ].filter((x): x is string => Boolean(x));
    return { title, chips };
  })();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] md:flex">
        <TripSidebar tripId={tripId} />
        <div className="w-full px-4 pb-24 pt-6 md:px-6 md:pb-10 md:pt-8">
          <TripTopbar meta={meta} />
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
