import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusNFT | Mint the Future",
  description:
    "A futuristic NFT collection where digital art meets blockchain. Mint your unique NexusNFT today.",
  keywords: ["nft", "blockchain", "ethereum", "nexusnft", "mint"],
  openGraph: {
    title: "NexusNFT | Mint the Future",
    description: "A futuristic NFT collection on Ethereum",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-grid min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}