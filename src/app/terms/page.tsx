import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Terms of Service | Wayfarer",
  description: "Basic terms for using Wayfarer AI travel planning.",
};

export default function TermsPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Terms"
      title="Terms of Service"
      description="Wayfarer helps you draft travel ideas and itineraries. By using the app, you agree to use those plans as suggestions rather than guaranteed travel advice."
    >
      <p>
        AI-generated itineraries may be incomplete or inaccurate. Always verify opening hours, prices, transit, visas,
        safety guidance, and booking details with official providers before you travel.
      </p>
      <p>
        You are responsible for the trips you book and the information you choose to share with Wayfarer.
      </p>
    </SimpleMarketingPage>
  );
}
