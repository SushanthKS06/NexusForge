"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { motion } from "framer-motion";
import { Shield, Loader2, RefreshCw, DollarSign, Clock, Eye, Coins, PauseCircle, PlayCircle } from "lucide-react";
import { useMintInfo, useOwner } from "@/hooks/useContract";
import { NexusNFTABI } from "@/lib/contract";
import { formatEther } from "@/lib/utils";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { mintInfo } = useMintInfo();
  const { data: owner } = useOwner();

  const [merkleRoot, setMerkleRoot] = useState("");
  const [baseUri, setBaseUri] = useState("");
  const [publicPrice, setPublicPrice] = useState("");
  const [allowlistPrice, setAllowlistPrice] = useState("");
  const [allowlistStart, setAllowlistStart] = useState("");
  const [publicStart, setPublicStart] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  const handleAction = async (functionName: string, args: unknown[], value?: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: NexusNFTABI,
      functionName,
      args,
      value,
    });
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 mt-4">Connect your wallet to access admin controls.</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-400 mt-4">Only the contract owner can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 mt-2">Manage the NexusNFT contract.</p>
      </motion.div>

      {/* Contract Overview */}
      {mintInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold text-lg">Contract Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Minted:</span>
              <br />
              <span className="font-mono">{mintInfo.totalSupply.toString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Supply:</span>
              <br />
              <span className="font-mono">{mintInfo.maxSupply.toString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Phase:</span>
              <br />
              <span className="font-mono">{["Not Started", "Allowlist", "Public", "Ended"][mintInfo.salePhase]}</span>
            </div>
            <div>
              <span className="text-gray-500">Paused:</span>
              <br />
              <span className={mintInfo.isPaused ? "text-red-400" : "text-green-400"}>
                {mintInfo.isPaused ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Admin Actions Grid */}
      <div className="grid gap-6">
        {/* Reveal */}
        <AdminCard
          icon={Eye}
          title="Reveal Collection"
          desc="Set the base URI for revealed metadata. This is irreversible."
        >
          <input
            type="text"
            placeholder="ipfs://Qm..."
            value={baseUri}
            onChange={(e) => setBaseUri(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm font-mono focus:border-cyan-500/50 focus:outline-none"
          />
          <button
            onClick={() => handleAction("reveal", [baseUri])}
            disabled={isPending || !baseUri}
            className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reveal"}
          </button>
        </AdminCard>

        {/* Merkle Root */}
        <AdminCard
          icon={Coins}
          title="Update Merkle Root"
          desc="Set or update the allowlist Merkle root."
        >
          <input
            type="text"
            placeholder="0x..."
            value={merkleRoot}
            onChange={(e) => setMerkleRoot(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm font-mono focus:border-cyan-500/50 focus:outline-none"
          />
          <button
            onClick={() => handleAction("setMerkleRoot", [merkleRoot as `0x${string}`])}
            disabled={isPending || !merkleRoot}
            className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
          </button>
        </AdminCard>

        {/* Prices */}
        <div className="grid md:grid-cols-2 gap-6">
          <AdminCard icon={DollarSign} title="Public Price" desc="ETH">
            <input
              type="text"
              placeholder="0.05"
              value={publicPrice}
              onChange={(e) => setPublicPrice(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm font-mono focus:border-cyan-500/50 focus:outline-none"
            />
            <button
              onClick={() => handleAction("setPublicPrice", [BigInt(Number(publicPrice) * 1e18)])}
              disabled={isPending || !publicPrice}
              className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
            >
              Update
            </button>
          </AdminCard>

          <AdminCard icon={DollarSign} title="Allowlist Price" desc="ETH">
            <input
              type="text"
              placeholder="0.03"
              value={allowlistPrice}
              onChange={(e) => setAllowlistPrice(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm font-mono focus:border-cyan-500/50 focus:outline-none"
            />
            <button
              onClick={() => handleAction("setAllowlistPrice", [BigInt(Number(allowlistPrice) * 1e18)])}
              disabled={isPending || !allowlistPrice}
              className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
            >
              Update
            </button>
          </AdminCard>
        </div>

        {/* Sale Times */}
        <AdminCard icon={Clock} title="Sale Times" desc="Set timestamps for allowlist and public sales.">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={allowlistStart}
              onChange={(e) => setAllowlistStart(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:border-cyan-500/50 focus:outline-none"
            />
            <input
              type="datetime-local"
              value={publicStart}
              onChange={(e) => setPublicStart(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              const alStart = Math.floor(new Date(allowlistStart).getTime() / 1000);
              const pubStart = Math.floor(new Date(publicStart).getTime() / 1000);
              handleAction("setSaleTimes", [BigInt(alStart), BigInt(pubStart)]);
            }}
            disabled={isPending || !allowlistStart || !publicStart}
            className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
          >
            Update
          </button>
        </AdminCard>

        {/* Pause / Unpause */}
        <AdminCard
          icon={mintInfo?.isPaused ? PlayCircle : PauseCircle}
          title={mintInfo?.isPaused ? "Unpause Minting" : "Pause Minting"}
          desc={mintInfo?.isPaused ? "Resume minting operations." : "Emergency pause all minting."}
        >
          <button
            onClick={() => handleAction("setPaused", [!mintInfo?.isPaused])}
            disabled={isPending}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              mintInfo?.isPaused
                ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
                : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {mintInfo?.isPaused ? "Unpause" : "Pause"}
          </button>
        </AdminCard>

        {/* Withdraw */}
        <AdminCard icon={RefreshCw} title="Withdraw Funds" desc="Withdraw all ETH from the contract.">
          <button
            onClick={() => handleAction("withdraw", [])}
            disabled={isPending}
            className="px-6 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Withdraw All"}
          </button>
        </AdminCard>
      </div>

      {isSuccess && (
        <div className="text-green-400 text-sm text-center bg-green-500/10 rounded-lg p-4">
          Transaction confirmed!
        </div>
      )}
    </div>
  );
}

function AdminCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-cyan-400" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="flex gap-3 items-end">{children}</div>
    </div>
  );
}