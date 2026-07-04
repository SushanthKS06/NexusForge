export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface MintInfo {
  totalSupply: bigint;
  maxSupply: bigint;
  publicPrice: bigint;
  allowlistPrice: bigint;
  maxMintPerWallet: bigint;
  allowlistMintLimit: bigint;
  allowlistStartTime: bigint;
  publicStartTime: bigint;
  isRevealed: boolean;
  salePhase: number;
  isPaused: boolean;
  merkleRoot: `0x${string}`;
}

export interface TokenInfo {
  tokenId: bigint;
  metadata: NFTMetadata | null;
  owner: string;
}

export interface SalePhase {
  label: string;
  color: string;
  active: boolean;
}

export type ChainConfig = {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  currency: string;
};