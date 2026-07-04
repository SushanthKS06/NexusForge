"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Coins, Palette, Zap } from "lucide-react";
import { useMintInfo } from "@/hooks/useContract";
import { getSalePhaseDetails } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Gas Optimized",
    desc: "Built with ERC-721A for the most efficient minting costs",
  },
  {
    icon: Shield,
    title: "Secure & Audited",
    desc: "OpenZeppelin standards, ReentrancyGuard, and Ownable",
  },
  {
    icon: Palette,
    title: "Reveal Mechanism",
    desc: "Blind mint then reveal — full surprise and rarity system",
  },
  {
    icon: Coins,
    title: "Royalty Support",
    desc: "ERC-2981 ensures creators earn 7.5% on secondary sales",
  },
];

export default function HomePage() {
  const { mintInfo } = useMintInfo();

  const progressPercent = mintInfo
    ? Number((mintInfo.totalSupply * 10000n) / mintInfo.maxSupply) / 100
    : 0;
  const salePhase = mintInfo ? getSalePhaseDetails(mintInfo.salePhase) : { label: "...", color: "" };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="pt-16 md:pt-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Mint the{" "}
              <span className="neon-text text-cyan-400">Future</span>
            </h1>
            <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed">
              NexusNFT is a curated digital art collection living on the
              blockchain. Each piece is a gateway to a futuristic digital
              frontier.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/mint"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all neon-glow"
            >
              Mint Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-gray-300 font-semibold text-lg hover:border-cyan-500/30 hover:text-cyan-300 transition-all"
            >
              View Gallery
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      {mintInfo && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {mintInfo.totalSupply.toString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">Minted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {mintInfo.maxSupply.toString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Supply</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${salePhase.color}`}>
                  {salePhase.label}
                </div>
                <div className="text-sm text-gray-500 mt-1">Phase</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {mintInfo.isRevealed ? "Yes" : "No"}
                </div>
                <div className="text-sm text-gray-500 mt-1">Revealed</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Minting Progress</span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Features */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why <span className="neon-text text-cyan-400">NexusNFT</span>?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="glass-card rounded-xl p-6 space-y-4 hover:border-cyan-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <feat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-lg">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-12 space-y-6"
        >
          <h2 className="text-3xl font-bold">
            Ready to Join the Nexus?
          </h2>
          <p className="text-gray-400">
            Connect your wallet and mint your unique NexusNFT today.
          </p>
          <Link
            href="/mint"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 text-black font-semibold text-lg hover:bg-cyan-400 transition-all neon-glow"
          >
            Start Minting
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}