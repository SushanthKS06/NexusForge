"use client";

import { http, createStorage, cookieStorage } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, cookieToInitialAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID || "11155111");
const targetChain = chainId === 1 ? mainnet : sepolia;

export const config = getDefaultConfig({
  appName: "NexusNFT",
  projectId,
  chains: [targetChain],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const queryClient = new QueryClient();

export function Providers({ children, cookie }: { children: ReactNode; cookie?: string }) {
  const initialAccount = cookie ? cookieToInitialAccount(config, cookie) : undefined;

  return (
    <WagmiProvider config={config} initialState={initialAccount}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00ffff",
            accentColorForeground: "#000000",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}