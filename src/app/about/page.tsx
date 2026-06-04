import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "About | Wayfarer",
  description: "About Wayfarer AI travel planning.",
};

export default function AboutPage() {
  return (
    <SimpleMarketingPage
      eyebrow="About Wayfarer"
      title="About Wayfarer"
      description="Wayfarer helps travelers turn a rough idea into a structured, editable plan: days, activities, maps, budgets, notes, and shareable itineraries in one calm workspace."
    >
      <p>
        The product is designed around one simple flow: describe your trip, generate a practical itinerary,
        then refine it visually instead of wrestling with a chat transcript.
      </p>
      <p>
        AI suggestions are treated as a starting point, not a guarantee. Wayfarer keeps verification notes,
        source fields, and editing controls close to the plan so travelers can check hours, prices, and
        booking details before committing.
      </p>
    </SimpleMarketingPage>
  );
}
