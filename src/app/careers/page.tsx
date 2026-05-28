import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Careers | Wayfarer",
  description: "Career opportunities at Wayfarer.",
};

export default function CareersPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Coming Soon"
      title="Careers"
      description="Wayfarer is not hiring publicly yet. Check back as the product grows."
    />
  );
}
