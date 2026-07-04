"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { ImageIcon, Loader2 } from "lucide-react";
import { NexusNFTABI } from "@/lib/contract";
import { useMintInfo, useTokenURI } from "@/hooks/useContract";
import { ipfsToHttp } from "@/lib/utils";
import NFTGalleryCard from "@/components/NFTGalleryCard";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

const PAGE_SIZE = 20;

export default function GalleryPage() {
  const { mintInfo, isLoading: infoLoading } = useMintInfo();
  const [page, setPage] = useState(1);

  const totalMinted = mintInfo ? Number(mintInfo.totalSupply) : 0;
  const totalPages = Math.max(1, Math.ceil(totalMinted / PAGE_SIZE));

  // Generate token IDs for the current page
  const tokenIds = Array.from(
    { length: Math.min(PAGE_SIZE, totalMinted - (page - 1) * PAGE_SIZE) },
    (_, i) => BigInt((page - 1) * PAGE_SIZE + i + 1)
  );

  if (infoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold">Gallery</h1>
        <p className="text-gray-400">
          Browse the NexusNFT collection.{" "}
          {mintInfo?.isRevealed ? "" : "Tokens are currently unrevealed."}
        </p>
      </motion.div>

      {totalMinted === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No NFTs minted yet. Be the first!</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tokenIds.map((tokenId, idx) => (
              <motion.div
                key={tokenId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <NFTGalleryCard tokenId={tokenId} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-6 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-6 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}