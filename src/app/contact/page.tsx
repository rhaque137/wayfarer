import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Contact | Wayfarer",
  description: "Contact the Wayfarer team for product feedback and support.",
};

export default function ContactPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Contact"
      title="Contact Wayfarer"
      description="Have feedback, a support question, or an idea for the planner? Send a note and include the trip or page you were working on."
    >
      <p>Email: hello@wayfarer.app</p>
      <p>Support requests are reviewed as the product evolves. For urgent travel decisions, confirm details directly with airlines, hotels, and official destination sources.</p>
    </SimpleMarketingPage>
  );
}
