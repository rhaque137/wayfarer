import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "About | Wayfarer",
  description: "About Wayfarer AI travel planning.",
};

export default function AboutPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Coming Soon"
      title="About Wayfarer"
      description="Wayfarer is an AI travel planning app built to turn loose trip ideas into practical itineraries you can refine, save, and share."
    />
  );
}
