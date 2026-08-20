import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import Footer from "@/components/Footer";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://garden-by-zee.vercel.app'),
  title: {
    default: "Garden by Zee | Premium Live Plants, Seeds & Gardening Supplies",
    template: "%s | Garden by Zee",
  },
  description: "Discover healthy indoor & outdoor live plants, pots, planters, organic seeds, and garden care essentials at Garden by Zee. Fast All-India shipping with guaranteed 30-day plant protection.",
  keywords: ["Garden by Zee", "Live Plants Online", "Houseplants India", "Garden Supplies", "Seeds", "Planters", "Indoor Plants"],
  authors: [{ name: "Garden by Zee" }],
  creator: "Garden by Zee",
  publisher: "Garden by Zee",
  
  // WhatsApp / Facebook / OpenGraph previews
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://garden-by-zee.vercel.app",
    siteName: "Garden by Zee",
    title: "Garden by Zee | Premium Live Plants, Seeds & Gardening Supplies",
    description: "Buy healthy indoor & outdoor live plants, pots, planters, organic seeds & fertilizers online. Fast shipping across India with 30-Day Plant Guarantee.",
    images: [
      {
        url: "https://garden-by-zee.vercel.app/images/hero_img_1.png",
        secureUrl: "https://garden-by-zee.vercel.app/images/hero_img_1.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Garden by Zee - Live Plants & Garden Essentials",
      },
    ],
  },

  // Twitter / X card previews
  twitter: {
    card: "summary_large_image",
    title: "Garden by Zee | Premium Live Plants & Gardening Supplies",
    description: "Buy healthy indoor & outdoor live plants, pots, planters, organic seeds & fertilizers online. Fast shipping across India.",
    images: ["https://garden-by-zee.vercel.app/images/hero_img_1.png"],
    creator: "@gardenbyzee",
  },

  // WhatsApp & Scrapers Meta Tags
  other: {
    "og:image": "https://garden-by-zee.vercel.app/images/hero_img_1.png",
    "og:image:secure_url": "https://garden-by-zee.vercel.app/images/hero_img_1.png",
    "og:image:type": "image/png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "theme-color": "#183D2B",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F2E9] text-[#202722]">
        <CartProvider>{children}<Footer /></CartProvider>
      </body>
    </html>
  );
}
