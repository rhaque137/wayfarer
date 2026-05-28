import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Support | Wayfarer",
  description: "Get help with Wayfarer trip planning and account questions.",
};

export default function SupportPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Support"
      title="Support"
      description="If something does not look right, try regenerating the plan, editing your prompt with more detail, or contacting the team with the trip link."
    >
      <p>Common questions: saved trips, AI itinerary edits, destination details, and account access.</p>
      <p>For travel-critical details like entry rules, closures, weather, or prices, check official sources before booking.</p>
    </SimpleMarketingPage>
  );
}
