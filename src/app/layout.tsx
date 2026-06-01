import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Wayfarer – AI Travel Planner",
  description: "Plan your perfect trip with AI. Save itineraries, discover destinations, and travel smarter.",
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
