import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitae Studio",
  description:
    "Build a polished, standard-format resume with secure accounts, a focused dashboard, live preview, and PDF export.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
