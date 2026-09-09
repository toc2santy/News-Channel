import type { Metadata } from "next";
import { Archivo, Barlow_Condensed, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Same type system as the Defence Opportunity Intelligence project:
// Archivo for display/headers, Inter for body copy, IBM Plex Mono for
// mono labels/stamps, Barlow Condensed for uppercase eyebrow labels.
const archivo = Archivo({ variable: "--font-display", subsets: ["latin"], weight: ["500", "700", "800", "900"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });
const barlow = Barlow_Condensed({ variable: "--font-label", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "News Channel",
  description: "Categorized news from public-service broadcasters and official sources only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${plexMono.variable} ${barlow.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
