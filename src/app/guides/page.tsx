import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Guides | Wayfarer",
  description: "Curated destination guides from Wayfarer.",
};

export default function GuidesPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Coming Soon"
      title="Destination guides"
      description="Curated city guides are coming soon. For now, start from the homepage and ask Wayfarer to build a guide for any destination."
    />
  );
}
