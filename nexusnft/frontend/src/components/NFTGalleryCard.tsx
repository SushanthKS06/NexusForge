"use client";

import { useTokenURI } from "@/hooks/useContract";
import { ipfsToHttp } from "@/lib/utils";
import { ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function NFTGalleryCard({ tokenId }: { tokenId: bigint }) {
  const { metadata, isLoading } = useTokenURI(tokenId);
  const [imgError, setImgError] = useState(false);

  const imageUrl = metadata?.image ? ipfsToHttp(metadata.image) : null;
  const name = metadata?.name || `NexusNFT #${tokenId.toString()}`;

  return (
    <div className="glass-card rounded-xl overflow-hidden group hover:border-cyan-500/30 transition-all">
      {/* Image */}
      <div className="aspect-square bg-gray-900 relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-700">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs">Unrevealed</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm truncate">{name}</h3>
        {metadata?.attributes && (
          <div className="flex flex-wrap gap-1">
            {metadata.attributes.slice(0, 3).map((attr) => (
              <span
                key={attr.trait_type}
                className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                {attr.value as string}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}