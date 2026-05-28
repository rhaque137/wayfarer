import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Community | Wayfarer",
  description: "Wayfarer community updates.",
};

export default function CommunityPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Coming Soon"
      title="Community"
      description="Community features are coming soon. Until then, share feedback through the contact page and help shape what Wayfarer becomes."
    />
  );
}
