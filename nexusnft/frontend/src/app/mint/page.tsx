"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { motion } from "framer-motion";
import { Hexagon, Minus, Plus, Loader2, Sparkles } from "lucide-react";
import { useMintInfo, useUserMintInfo } from "@/hooks/useContract";
import { NexusNFTABI } from "@/lib/contract";
import { getSalePhaseDetails, formatEther } from "@/lib/utils";
import confetti from "canvas-confetti";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { mintInfo, isLoading } = useMintInfo();
  const { mintedPerWallet, isAllowlisted } = useUserMintInfo(address);
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [quantity, setQuantity] = useState(1);
  const [mintError, setMintError] = useState<string | null>(null);

  // Reset quantity when mint succeeds
  useEffect(() => {
    if (isSuccess) {
      setQuantity(1);
      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#00ffff", "#00ffcc", "#ff00ff", "#ffffff"],
      });
    }
  }, [isSuccess]);

  const handleMint = useCallback(async () => {
    setMintError(null);
    if (!mintInfo || !address) return;

    const salePhase = mintInfo.salePhase;
    const isAllowlistPhase = salePhase === 1;
    const isPublicPhase = salePhase === 2;

    if (!isAllowlistPhase && !isPublicPhase) {
      setMintError("Sale is not active");
      return;
    }

    if (mintInfo.isPaused) {
      setMintError("Minting is paused");
      return;
    }

    // Validate wallet limit
    const maxMint = isAllowlistPhase
      ? mintInfo.allowlistMintLimit
      : mintInfo.maxMintPerWallet;
    if (mintedPerWallet + BigInt(quantity) > maxMint) {
      setMintError(
        `Max ${maxMint.toString()} per wallet. You've minted ${mintedPerWallet.toString()} already.`
      );
      return;
    }

    // Validate price
    const price = isAllowlistPhase ? mintInfo.allowlistPrice : mintInfo.publicPrice;
    const totalCost = price * BigInt(quantity);

    if (isAllowlistPhase && isAllowlisted) {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NexusNFTABI,
        functionName: "mintAllowlist",
        args: [BigInt(quantity), []],
        value: totalCost,
      });
    } else if (isPublicPhase) {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NexusNFTABI,
        functionName: "mintPublic",
        args: [BigInt(quantity)],
        value: totalCost,
      });
    } else {
      setMintError("You are not allowlisted for the presale");
    }
  }, [mintInfo, address, quantity, mintedPerWallet, isAllowlisted, writeContract]);

  const salePhase = mintInfo ? getSalePhaseDetails(mintInfo.salePhase) : { label: "...", color: "" };
  const currentPrice =
    mintInfo?.salePhase === 1
      ? mintInfo.allowlistPrice
      : mintInfo?.salePhase === 2
        ? mintInfo.publicPrice
        : 0n;

  const progressPercent = mintInfo
    ? Number((mintInfo.totalSupply * 10000n) / mintInfo.maxSupply) / 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Hexagon className="w-12 h-12 text-cyan-400 mx-auto" />
        <h1 className="text-4xl font-bold">Mint Your NexusNFT</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Each NexusNFT is a unique gateway to the digital frontier. Mint yours
          and join the network.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : mintInfo ? (
        <>
          {/* Status Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="glass-card rounded-xl p-4 text-center">
              <div className={`text-lg font-bold ${salePhase.color}`}>{salePhase.label}</div>
              <div className="text-xs text-gray-500 mt-1">Sale Phase</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-cyan-400">
                {formatEther(currentPrice)} ETH
              </div>
              <div className="text-xs text-gray-500 mt-1">Price</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-white">
                {mintInfo.totalSupply.toString()} / {mintInfo.maxSupply.toString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Minted</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-purple-400">
                {mintedPerWallet.toString()} /{" "}
                {mintInfo.salePhase === 1
                  ? mintInfo.allowlistMintLimit.toString()
                  : mintInfo.maxMintPerWallet.toString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Your Mint</div>
            </div>
          </motion.div>

          {/* Mint Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <div className="glass-card rounded-2xl p-8 space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Supply Progress</span>
                  <span>{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <label className="text-sm text-gray-400">Quantity</label>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-xl border border-gray-700 flex items-center justify-center hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-4xl font-bold text-cyan-400 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      const max = mintInfo.salePhase === 1
                        ? Number(mintInfo.allowlistMintLimit)
                        : Number(mintInfo.maxMintPerWallet);
                      setQuantity(Math.min(max, quantity + 1));
                    }}
                    disabled={
                      quantity >=
                      (mintInfo.salePhase === 1
                        ? Number(mintInfo.allowlistMintLimit)
                        : Number(mintInfo.maxMintPerWallet))
                    }
                    className="w-12 h-12 rounded-xl border border-gray-700 flex items-center justify-center hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t border-gray-800">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-xl font-bold text-cyan-400">
                  {formatEther(currentPrice * BigInt(quantity))} ETH
                </span>
              </div>

              {/* Error */}
              {(mintError || writeError) && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-3">
                  {mintError || writeError?.message?.slice(0, 100)}
                </div>
              )}

              {/* Success */}
              {isSuccess && (
                <div className="text-green-400 text-sm text-center bg-green-500/10 rounded-lg p-3">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Successfully minted {quantity} NexusNFT(s)!
                </div>
              )}

              {/* Mint Button */}
              <button
                onClick={handleMint}
                disabled={
                  !isConnected ||
                  isWritePending ||
                  isConfirming ||
                  mintInfo.isPaused ||
                  mintInfo.totalSupply >= mintInfo.maxSupply
                }
                className="w-full py-4 rounded-xl bg-cyan-500 text-black font-bold text-lg hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all neon-glow flex items-center justify-center gap-2"
              >
                {isWritePending || isConfirming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isConfirming ? "Confirming..." : "Check Wallet..."}
                  </>
                ) : !isConnected ? (
                  "Connect Wallet to Mint"
                ) : mintInfo.isPaused ? (
                  "Minting Paused"
                ) : mintInfo.totalSupply >= mintInfo.maxSupply ? (
                  "Sold Out"
                ) : (
                  "Mint Now"
                )}
              </button>

              {mintInfo.isRevealed && (
                <p className="text-xs text-gray-500 text-center">
                  Collection has been revealed!
                </p>
              )}
            </div>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">
          Unable to load mint data. Check your wallet connection.
        </div>
      )}
    </div>
  );
}