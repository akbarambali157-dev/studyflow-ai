import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STUDYFLOW AI — Your learning workspace",
  description:
    "Turn lecture materials into clear explanations, focused revision notes, and practice questions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
