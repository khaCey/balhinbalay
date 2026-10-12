import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BalhinBalay — Find your place",
  description: "Explore currently eligible real homes to rent or buy with BalhinBalay search and map. Map pins appear only for confirmed public locations.",
  openGraph: {
    type: "website",
    title: "BalhinBalay — Find your place",
    description: "Explore currently eligible real homes with BalhinBalay search and map. Map pins appear only for confirmed public locations.",
    siteName: "BalhinBalay",
  },
  twitter: {
    card: "summary",
    title: "BalhinBalay — Find your place",
    description: "Explore currently eligible real homes with BalhinBalay search and map. Map pins appear only for confirmed public locations.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en-GB"><body>{children}</body></html>; }
