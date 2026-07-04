import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/registerSW";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://tea20cafe.com"), // Replace with your domain
  title: {
    default: "Tea 20 Cafe | Best Tea, Coffee & Cafe in Jaipur",
    template: "%s | Tea 20 Cafe",
  },
  description:
    "Order fresh tea, coffee, sandwiches, burgers, pasta, Maggi, shakes, mocktails, and more from Tea 20 Cafe. Located at Gyan Vihar Marg, OBC Colony, Karolan Ka Barh, Jaipur. Dine-in, takeaway, and online ordering available.",

  keywords: [
    "Tea 20 Cafe",
    "Tea 20",
    "Cafe in Jaipur",
    "Best Cafe Jaipur",
    "Tea Cafe Jaipur",
    "Coffee Shop Jaipur",
    "Tea near Gyan Vihar",
    "Cafe near Gyan Vihar University",
    "Cafe near JECRC",
    "Tea near me",
    "Coffee near me",
    "Cafe in Jagatpura",
    "Cafe in OBC Colony",
    "Masala Chai Jaipur",
    "Cold Coffee Jaipur",
    "Sandwich Jaipur",
    "Burger Jaipur",
    "Pasta Jaipur",
    "Maggi Cafe",
    "Mocktails Jaipur",
    "Shakes Jaipur",
    "Online Food Order Jaipur",
    "Takeaway Cafe Jaipur",
    "Best Tea in Jaipur",
    "Best Coffee in Jaipur",
  ],

  authors: [{ name: "Tea 20 Cafe" }],
  creator: "Tea 20 Cafe",
  publisher: "Tea 20 Cafe",

  openGraph: {
    title: "Tea 20 Cafe | Best Tea & Coffee Cafe in Jaipur",
    description:
      "Enjoy premium tea, coffee, sandwiches, burgers, pasta, Maggi, shakes, mocktails and more at Tea 20 Cafe. Order online or visit us in Jaipur.",
    url: "https://tea20cafe.com",
    siteName: "Tea 20 Cafe",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tea 20 Cafe Jaipur",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Tea 20 Cafe | Best Tea & Coffee Cafe in Jaipur",
    description:
      "Fresh tea, coffee, burgers, sandwiches, pasta, Maggi, shakes, mocktails & more. Order online from Tea 20 Cafe.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://tea20cafe.com",
  },

  robots: {
    index: true,
    follow: true,
  },

  category: "restaurant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RegisterSW />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
