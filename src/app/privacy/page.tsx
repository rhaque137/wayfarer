import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/marketing/SimpleMarketingPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Wayfarer",
  description: "How Wayfarer handles account, trip, and AI planning data.",
};

export default function PrivacyPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="Wayfarer uses the information you provide to create and save travel plans, manage your account, and improve the planning experience."
    >
      <p>
        Account and trip data may be stored with Supabase so you can return to your itineraries. Trip prompts and related
        planning context may be sent to OpenAI to generate itinerary suggestions.
      </p>
      <p>
        Avoid entering sensitive personal information into trip prompts. AI-generated recommendations may include
        inaccuracies, so verify travel details before booking.
      </p>
    </SimpleMarketingPage>
  );
}
