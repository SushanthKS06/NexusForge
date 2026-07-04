"use client";

import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { NexusNFTABI } from "@/lib/contract";
import { formatEther, ipfsToHttp } from "@/lib/utils";
import { MintInfo, TokenInfo, NFTMetadata } from "@/types";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

function useContractRead<T>(functionName: string, args: unknown[] = []): { data: T | undefined; isLoading: boolean; error: Error | null } {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NexusNFTABI,
    functionName,
    args,
  });
  return {
    data: result.data as T | undefined,
    isLoading: result.isLoading,
    error: result.error as Error | null,
  };
}

export function useMintInfo(): {
  mintInfo: MintInfo | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data: totalSupply } = useContractRead<bigint>("totalSupply");
  const { data: maxSupply } = useContractRead<bigint>("maxSupply");
  const { data: publicPrice } = useContractRead<bigint>("publicPrice");
  const { data: allowlistPrice } = useContractRead<bigint>("allowlistPrice");
  const { data: maxMintPerWallet } = useContractRead<bigint>("maxMintPerWallet");
  const { data: allowlistMintLimit } = useContractRead<bigint>("allowlistMintLimit");
  const { data: allowlistStartTime } = useContractRead<bigint>("allowlistStartTime");
  const { data: publicStartTime } = useContractRead<bigint>("publicStartTime");
  const { data: isRevealed } = useContractRead<boolean>("isRevealed");
  const { data: salePhase } = useContractRead<number>("getSalePhase");
  const { data: isPaused } = useContractRead<boolean>("paused");
  const { data: merkleRoot } = useContractRead<`0x${string}`>("allowlistMerkleRoot");

  const isLoading = !totalSupply || !maxSupply;

  if (!totalSupply || !maxSupply) {
    return { mintInfo: undefined, isLoading: true, error: null };
  }

  return {
    mintInfo: {
      totalSupply,
      maxSupply,
      publicPrice: publicPrice || 0n,
      allowlistPrice: allowlistPrice || 0n,
      maxMintPerWallet: maxMintPerWallet || 20n,
      allowlistMintLimit: allowlistMintLimit || 5n,
      allowlistStartTime: allowlistStartTime || 0n,
      publicStartTime: publicStartTime || 0n,
      isRevealed: isRevealed || false,
      salePhase: salePhase ?? 0,
      isPaused: isPaused || false,
      merkleRoot: merkleRoot || "0x0000",
    },
    isLoading,
    error: null,
  };
}

export function useUserMintInfo(address: `0x${string}` | undefined) {
  const { data: mintedPerWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NexusNFTABI,
    functionName: "mintedPerWallet",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address },
  });

  const { data: isAllowlisted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NexusNFTABI,
    functionName: "isAllowlisted",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address },
  });

  return {
    mintedPerWallet: (mintedPerWallet as bigint) || 0n,
    isAllowlisted: (isAllowlisted as boolean) || false,
  };
}

export function useUserTokens(address: `0x${string}` | undefined) {
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

  const tokenIds: bigint[] = [];
  if (balance && totalSupply && address) {
    // For simplicity, we get tokens by iterating
    // In production, use a subgraph or custom indexer
  }

  return { tokenIds, balance: (balance as bigint) || 0n };
}

export function useTokenURI(tokenId: bigint) {
  const { data: uri } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NexusNFTABI,
    functionName: "tokenURI",
    args: [tokenId],
    query: { enabled: tokenId > 0n },
  });

  const { data: metadata, isLoading: metaLoading } = useQuery<NFTMetadata | null>({
    queryKey: ["tokenMetadata", tokenId.toString(), uri],
    queryFn: async () => {
      if (!uri) return null;
      const httpUrl = ipfsToHttp(uri as string);
      try {
        const res = await fetch(httpUrl);
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!uri,
  });

  return { uri: uri as string, metadata, isLoading: metaLoading };
}

export function useOwner() {
  return useContractRead<`0x${string}`>("owner");
}