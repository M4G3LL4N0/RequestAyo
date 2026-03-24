import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
