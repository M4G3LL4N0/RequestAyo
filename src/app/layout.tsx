import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Ayo | Reliable AI for real-world decisions",
  description:
    "Ayo helps you choose the best ride, food, delivery, business, or next step — then helps you get it done.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
