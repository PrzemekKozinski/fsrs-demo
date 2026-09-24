import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "FSRS Simulator",
  description: "Interactive FSRS algorithm simulator",
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