import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  metadataBase: new URL("https://wayfarer-ten.vercel.app"),
  title: {
    default: "Wayfarer – AI Travel Planner",
    template: "%s | Wayfarer",
  },
  description: "Plan your perfect trip with AI. Save itineraries, discover destinations, and travel smarter.",
  openGraph: {
    title: "Wayfarer – AI Travel Planner",
    description: "Create editable, map-aware AI travel plans with structured itineraries.",
    url: "https://wayfarer-ten.vercel.app",
    siteName: "Wayfarer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wayfarer – AI Travel Planner",
    description: "Create editable, map-aware AI travel plans with structured itineraries.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background text-foreground" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
