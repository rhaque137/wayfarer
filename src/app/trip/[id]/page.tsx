import { redirect } from "next/navigation";

export default async function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const q = sp?.q ? `?q=${encodeURIComponent(sp.q)}` : "";
  redirect(`/trip/${id}/chat/main${q}`);
}
