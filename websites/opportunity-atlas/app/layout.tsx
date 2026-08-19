import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Opportunity Atlas", description: "An interactive dashboard for exploring funded computer science research opportunities across Northern Europe." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
