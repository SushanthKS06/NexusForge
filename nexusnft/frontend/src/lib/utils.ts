import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

export function ipfsToHttp(uri: string): string {
  if (!uri) return "/placeholder.svg";
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
    return `${gateway}${cid}`;
  }
  return uri;
}

export function getSalePhaseDetails(phase: number): { label: string; color: string } {
  switch (phase) {
    case 0:
      return { label: "Not Started", color: "text-yellow-400" };
    case 1:
      return { label: "Allowlist Sale", color: "text-green-400" };
    case 2:
      return { label: "Public Sale", color: "text-cyan-400" };
    case 3:
      return { label: "Sold Out", color: "text-red-400" };
    default:
      return { label: "Unknown", color: "text-gray-400" };
  }
}