import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BalhinBalay — Find your place",
  description: "Browse sample homes and explore search and map features in the BalhinBalay beta preview. Listings are illustrative and enquiries are not delivered.",
  openGraph: {
    type: "website",
    title: "BalhinBalay — Find your place",
    description: "Explore sample homes with BalhinBalay's beta search and map preview. Listings are illustrative and enquiries are not delivered.",
    siteName: "BalhinBalay",
  },
  twitter: {
    card: "summary",
    title: "BalhinBalay — Find your place",
    description: "Explore sample homes with BalhinBalay's beta search and map preview. Listings are illustrative and enquiries are not delivered.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en-GB"><body>{children}</body></html>; }
