import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wayfarer",
  description: "Travel AI Companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background text-foreground" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
