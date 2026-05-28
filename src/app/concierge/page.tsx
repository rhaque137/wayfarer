import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "AI Concierge | Wayfarer",
  description: "AI concierge features for Wayfarer trip planning.",
};

export default function ConciergePage() {
  return (
    <SimpleMarketingPage
      eyebrow="Coming Soon"
      title="AI Concierge"
      description="The concierge experience is being shaped into a richer planning assistant. Today, you can use the trip planner to draft and refine AI-generated itineraries."
    />
  );
}
