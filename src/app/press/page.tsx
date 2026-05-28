import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Press | Wayfarer",
  description: "Press information for Wayfarer.",
};

export default function PressPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Coming Soon"
      title="Press"
      description="A press kit is coming soon. For now, contact the team with media or partnership inquiries."
    />
  );
}
