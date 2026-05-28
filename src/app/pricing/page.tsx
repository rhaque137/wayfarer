import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Pricing | Wayfarer",
  description: "Wayfarer is currently free to use with simple AI planning limits.",
};

export default function PricingPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Pricing"
      title="Free to use"
      description="Wayfarer is currently free to use. No credit card is required to start planning a trip."
    >
      <p>
        To keep the app available at low cost, usage may be limited during heavy demand. Future paid plans may add higher
        limits or collaboration features, but the core planner is free today.
      </p>
    </SimpleMarketingPage>
  );
}
