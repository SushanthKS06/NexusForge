# Frontend Documentation

## Overview

The NexusNFT frontend is built with **Next.js 14** (App Router), **TypeScript**, and **Tailwind CSS**. It provides a modern, responsive interface for interacting with the NexusNFT smart contract.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| wagmi v2 | React Hooks for Ethereum |
| viem | Type-safe Ethereum interaction |
| RainbowKit | Wallet connection UI |
| Framer Motion | Animations |
| canvas-confetti | Mint celebration effects |
| TanStack Query | Server state management |

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── app/                   # App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles + theme
│   │   ├── mint/page.tsx      # Mint page
│   │   ├── gallery/page.tsx   # Gallery page
│   │   ├── my-nfts/page.tsx   # User NFTs page
│   │   └── admin/page.tsx     # Admin panel
│   ├── components/            # Reusable components
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── NFTGalleryCard.tsx # NFT card component
│   ├── hooks/                 # Custom hooks
│   │   └── useContract.ts     # Contract interaction hooks
│   ├── lib/                   # Utilities
│   │   ├── utils.ts           # Helper functions
│   │   ├── contract.ts        # Contract ABI + config
│   │   └── providers.tsx      # wagmi + RainbowKit providers
│   └── types/                 # TypeScript type definitions
│       └── index.ts
├── .env.local                 # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Pages

### Home (`/`)
- Hero section with animated title and CTA
- Live minting stats (total minted, supply, phase, reveal status)
- Feature cards explaining benefits
- Progress bar showing minting progress

### Mint (`/mint`)
- Live sale phase indicator
- Current price display
- Supply progress with real-time updates
- Quantity selector (+ / - buttons)
- Total cost calculation
- Wallet connect prompt
- Confetti animation on successful mint
- Error handling for all edge cases

### Gallery (`/gallery`)
- Grid layout of minted NFTs
- Pagination (20 per page)
- Token metadata display
- Image loading states
- Unrevealed token placeholders

### My NFTs (`/my-nfts`)
- Wallet connection check
- User's NFT count display
- Grid of owned NFTs
- Call-to-action if no NFTs owned

### Admin (`/admin`)
- Owner-only access verification
- Contract overview stats
- Reveal management (set base URI)
- Merkle root update
- Price management (public + allowlist)
- Sale time configuration
- Pause/unpause toggle
- Withdraw funds

## Components

### `Navbar.tsx`
- Sticky navigation with backdrop blur
- Logo with animated glow effect
- Desktop navigation links
- RainbowKit ConnectButton
- Mobile hamburger menu

### `NFTGalleryCard.tsx`
- Token metadata display
- IPFS image loading with error handling
- Loading skeleton animation
- Trait badges
- Hover effects

## Hooks

### `useContract.ts`
- `useMintInfo()` — Fetches all contract state (supply, prices, phases)
- `useUserMintInfo(address)` — Fetches user-specific data (minted count, allowlist status)
- `useTokenURI(tokenId)` — Fetches token URI and metadata
- `useOwner()` — Fetches contract owner address

## Environment Variables

```env
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_CHAIN_ID=11155111
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
```

## Styling

### Theme
- Dark mode with cyber/futuristic aesthetic
- Cyan primary color (`#00FFFF`)
- Glass morphism card effects
- Neon glow text and borders
- Grid background pattern

### Key Classes
- `glass-card` — Backdrop blur with border
- `neon-glow` — Cyan box shadow
- `neon-text` — Cyan text shadow
- `bg-grid` — Subtle grid pattern background

## Animations
- Page entries with Framer Motion
- Hover effects on cards
- Neon pulse on interactive elements
- Confetti on successful mint
- Loading skeletons with shimmer

## Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Mobile hamburger navigation
- Adaptive grid layouts
- Touch-friendly button sizes

## Running Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Production Notes

1. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` after deployment
2. Set proper `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
3. Configure IPFS gateway URL
4. For production scale, integrate a subgraph or indexer for My NFTs page
5. Consider adding caching layer for metadata
