"use client";

import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { Wallet, ImageIcon, Loader2, ArrowRight } from "lucide-react";
import { NexusNFTABI } from "@/lib/contract";
import { useOwner } from "@/hooks/useContract";
import NFTGalleryCard from "@/components/NFTGalleryCard";
import Link from "next/link";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NexusNFTABI,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address },
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NexusNFTABI,
    functionName: "totalSupply",
  });

  // Generate user's token IDs by checking ownership
  const userTokenIds: bigint[] = [];
  if (address && totalSupply) {
    // In production, this should use a subgraph or event indexer
    // For now, we'll show a simplified approach
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto" />
          <h1 className="text-4xl font-bold">My NFTs</h1>
          <p className="text-gray-400">
            Connect your wallet to view your NFT collection.
          </p>
          <Link
            href="/mint"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/20 transition-all"
          >
            Go to Mint <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const balanceNum = Number(balance || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">My NFTs</h1>
        <p className="text-gray-400">
          You own <span className="text-cyan-400 font-semibold">{balanceNum}</span>{" "}
          NexusNFT{balanceNum !== 1 ? "s" : ""}.
        </p>
      </motion.div>

      {balanceNum === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">
            You don&apos;t own any NexusNFTs yet.
          </p>
          <Link
            href="/mint"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all neon-glow"
          >
            Mint Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userTokenIds.length > 0 ? (
            userTokenIds.map((tokenId, idx) => (
              <motion.div
                key={tokenId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <NFTGalleryCard tokenId={tokenId} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              <p>Loading your NFTs... For production, connect a subgraph or indexer.</p>
              <p className="text-sm mt-2">Use The Graph, Moralis, or a custom indexer for production.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}