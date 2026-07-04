<div align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/ERC--721A-4.2.3-00FFFF?style=for-the-badge" alt="ERC-721A" />
  <img src="https://img.shields.io/badge/wagmi-2.x-00D395?style=for-the-badge" alt="wagmi" />
  <img src="https://img.shields.io/badge/RainbowKit-latest-7B3FE4?style=for-the-badge" alt="RainbowKit" />
</div>

<br/>

<div align="center">
  <h1>🚀 NexusNFT</h1>
  <h3>Production-Ready NFT Minting Platform</h3>
  <p><i>Gas-efficient minting · Blind reveal · Royalty support · Allowlist with Merkle proofs</i></p>
</div>

<br/>

<div align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#smart-contract">Contract</a> •
  <a href="#frontend">Frontend</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#security">Security</a>
</div>

<br/>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Gas Optimized** | ERC-721A core — batch minting costs amortized across multiple tokens |
| 🎭 **Blind Mint & Reveal** | Mint unrevealed tokens → reveal metadata after sale ends |
| 💰 **ERC-2981 Royalties** | Default 7.5% royalty on secondary sales |
| 📜 **Allowlist / Presale** | Gas-efficient Merkle proof verification |
| 🛡️ **Access Controls** | Ownable, ReentrancyGuard, Pausable |
| 🔢 **Per-Wallet Limits** | Configurable mint caps for public and allowlist |
| 🏦 **Owner Withdrawal** | Secure ETH and ERC20 withdrawal functions |
| 📊 **Live Counter** | Real-time total minted and remaining supply |
| 🔍 **Reveal Status** | Track unrevealed/revealed state on-chain |
| 🎨 **Dark Futuristic UI** | Cyber aesthetic, glassmorphism, neon glow effects |
| 🎉 **Confetti on Mint** | Celebratory confetti animation on successful mints |
| 📱 **Fully Responsive** | Mobile-first design, works on all devices |
| 🔗 **Wallet Integration** | RainbowKit with MetaMask, WalletConnect, Coinbase, and more |

## 🛠️ Tech Stack

### Smart Contract

| Technology | Purpose |
|------------|---------|
| Solidity 0.8.24 | Smart contract language |
| OpenZeppelin v5.1 | Battle-tested contract libraries |
| ERC-721A v4.2 | Gas-efficient NFT standard |
| Hardhat v2.22 | Development environment |
| MerkleTreeJS | Allowlist proof generation |

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | React framework with SSR |
| TypeScript | Type safety across the stack |
| Tailwind CSS v3 | Utility-first styling |
| wagmi v2 | React hooks for Ethereum |
| viem | Type-safe Ethereum interaction |
| RainbowKit | Beautiful wallet connection |
| Framer Motion | Smooth animations |
| canvas-confetti | Mint celebration effects |
| TanStack Query | Data fetching & caching |

### Storage

| Service | Purpose |
|---------|---------|
| Pinata / NFT.Storage | Permanent IPFS metadata storage |
| IPFS Gateways | Content delivery |

## 📂 Project Structure

```
nexusnft/
├── contracts/
│   └── NexusNFT.sol              # Main ERC-721A contract
├── scripts/
│   ├── deploy.js                  # Deployment script
│   ├── generate-merkle.js         # Merkle tree generator
│   └── ipfs-upload.js             # IPFS upload automation
├── test/
│   └── NexusNFT.test.js           # Comprehensive test suite
├── frontend/                      # Next.js 14 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── globals.css        # Global styles
│   │   │   ├── mint/page.tsx      # Mint interface
│   │   │   ├── gallery/page.tsx   # NFT gallery
│   │   │   ├── my-nfts/page.tsx   # User collection
│   │   │   └── admin/page.tsx     # Admin panel
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Navigation
│   │   │   └── NFTGalleryCard.tsx # NFT display card
│   │   ├── hooks/
│   │   │   └── useContract.ts     # Contract hooks
│   │   ├── lib/
│   │   │   ├── utils.ts           # Utilities
│   │   │   ├── contract.ts        # ABI + config
│   │   │   └── providers.tsx      # wagmi providers
│   │   └── types/
│   │       └── index.ts           # Type definitions
│   ├── .env.local
│   └── package.json
├── docs/
│   ├── smart-contracts.md         # Contract documentation
│   ├── frontend.md                # Frontend documentation
│   ├── deployment.md              # Deployment guide
│   └── ipfs-guide.md              # IPFS setup guide
├── .env.example
├── hardhat.config.js
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+
- **npm** or **pnpm**
- **MetaMask** browser extension
- **WalletConnect Project ID** (from https://cloud.walletconnect.com)

### 1. Install Dependencies

```bash
# Navigate to project root
cd nexusnft

# Install root dependencies (Hardhat + scripts)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Set Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
PINATA_JWT=your_pinata_jwt_token
```

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run with gas report
npm run test:gas

# Run with coverage
npm run test:coverage
```

### 5. Start Local Node

```bash
# Terminal 1: Start local Hardhat node
npm run node
```

### 6. Deploy Locally

```bash
# Terminal 2: Deploy to localhost
npm run deploy:local
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

## 📝 Smart Contract

### Architecture

The `NexusNFT` contract (`contracts/NexusNFT.sol`) combines:

- **ERC721A** — Gas-efficient batch minting from Azuki
- **Ownable** — OpenZeppelin access control
- **ReentrancyGuard** — Protection against reentrancy attacks
- **Pausable** — Emergency stop mechanism
- **ERC2981** — Universal royalty standard

### Key Capabilities

| Function | Description |
|----------|-------------|
| `mintAllowlist(quantity, proof)` | Allowlist mint with Merkle verification |
| `mintPublic(quantity)` | Public sale mint |
| `reveal(baseUri)` | Set revealed metadata (irreversible) |
| `setMerkleRoot(root)` | Update allowlist Merkle root |
| `setPublicPrice(price)` | Update public mint price |
| `setPaused(state)` | Emergency pause |
| `withdraw()` | Withdraw contract ETH |

### Custom Errors

```solidity
error MaxSupplyExceeded();
error MaxMintPerWalletExceeded();
error InsufficientPayment();
error SaleNotActive();
error InvalidMerkleProof();
error AlreadyRevealed();
error ZeroAddress();
```

### Configuration Parameters

| Parameter | Constructor | Default |
|-----------|-------------|---------|
| Max Supply | ✔️ | 10,000 |
| Max Mint/Wallet | ✔️ | 20 |
| Allowlist Limit | ✔️ | 5 |
| Public Price | ✔️ | 0.05 ETH |
| Allowlist Price | ✔️ | 0.03 ETH |
| Royalty | ✔️ | 7.5% |
| Sale Times | ✔️ | Configurable |

## 🎨 Frontend

### Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with live stats and features |
| `/mint` | Full minting interface with quantity selector |
| `/gallery` | Browse minted NFTs with pagination |
| `/my-nfts` | View your owned NFTs |
| `/admin` | Owner-only contract management panel |

### Wallet Support

- MetaMask
- WalletConnect (mobile wallets)
- Coinbase Wallet
- Rainbow
- Ledger Live
- And 20+ more via RainbowKit

### Admin Panel

The admin page (`/admin`) provides owner-only controls for:
- Reveal collection (set base URI)
- Update Merkle root
- Manage prices (public + allowlist)
- Configure sale times
- Pause/unpause minting
- Withdraw contract funds

## 📦 Deployment

### Testnet (Sepolia)

```bash
npm run deploy:sepolia
```

### Mainnet

```bash
npm run deploy:mainnet
```

The deployment script:
1. Validates parameters
2. Deploys contract
3. Waits for confirmations
4. Verifies on Etherscan
5. Saves deployment info to `deployments/`

### Post-Deployment Steps

1. **Upload IPFS metadata** (images → metadata → unrevealed)
2. **Generate Merkle root** for allowlist
3. **Set Merkle root** on contract
4. **Update frontend** `.env` with contract address
5. **Reveal collection** after minting ends

## 🎨 Customization

### Collection Parameters

Edit `scripts/deploy.js`:
```javascript
name: "YourCollection",
symbol: "YOURS",
maxSupply: 5000,
maxMintPerWallet: 10,
publicPrice: ethers.parseEther("0.1"),
```

### Metadata Attributes

Edit `scripts/ipfs-upload.js`:
```javascript
const backgrounds = ["Custom Sky", "Digital Ocean", ...];
const rarities = ["Common", "Rare", "Legendary"];
```

### Frontend Theme

Edit `frontend/src/app/globals.css` to customize:
- Color scheme (CSS variables)
- Font
- Background effects
- Component styles

## 🛡️ Security

### Contract Security

- **ReentrancyGuard** on all mint and withdrawal functions
- **Ownable** for admin access control
- **Pausable** emergency stop mechanism
- **MerkleProof** verification prevents allowlist forgery
- **Custom errors** save gas over string messages
- **Checked math** — SafeMath built into Solidity 0.8+
- **Immutable variables** for core constants

### Best Practices

- All external calls follow checks-effects-interactions pattern
- Withdraw uses pull-over-push pattern
- Owner functions use `onlyOwner` modifier
- Mint functions are `nonReentrant` and `whenNotPaused`
- Supply and wallet limits enforced before minting
- Price validation prevents underpayment

### Audit

For production deployment, consider a professional audit from:
- ConsenSys Diligence
- Trail of Bits
- OpenZeppelin
- Certik

## 🧪 Testing

```bash
# Run test suite
npm test

# Gas report
npm run test:gas

# Coverage report
npm run test:coverage
```

Test coverage includes:
- Deployment configuration
- Allowlist minting (valid/invalid proofs)
- Public minting (price, limits, supply)
- Reveal mechanism (before/after)
- Admin functions (owner/non-owner)
- Pause/unpause behavior
- Withdrawal
- Royalty management
- Edge cases and error states

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `docs/smart-contracts.md` | Contract architecture, functions, events |
| `docs/frontend.md` | Frontend setup, components, hooks |
| `docs/deployment.md` | Full deployment workflow |
| `docs/ipfs-guide.md` | IPFS upload guide and metadata generation |

## 🔮 Future Improvements

| Feature | Description |
|---------|-------------|
| 🌐 **Subgraph Integration** | The Graph for efficient token queries |
| 🎲 **Randomized Reveal** | Fisher-Yates shuffle for true random reveal |
| 🔒 **Signature-Based Allowlist** | EIP-712 typed signatures as alternative |
| 💎 **Staking** | Stake NFTs for rewards or governance tokens |
| 🔄 **Lazy Minting** | Mint on first transfer for zero gas on launch |
| 📈 **Tiered Pricing** | Dynamic pricing based on demand |
| 🏗️ **DAO Governance** | Community voting for treasury management |
| 🌉 **Cross-Chain Bridge** | Expand to L2s (Arbitrum, Optimism) |
| 🔍 **On-Chain Metadata** | Fully on-chain SVG art (like OnChainMonkeys) |
| 🎯 **Custom Traits** | User-selectable traits during mint |

## 📄 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure contract libraries
- [ERC-721A](https://www.erc721a.org/) by Azuki for gas-efficient NFT standard
- [wagmi](https://wagmi.sh/) and [RainbowKit](https://rainbowkit.com/) for web3 frontend tools
- [Next.js](https://nextjs.org/) team for the incredible framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<div align="center">
  <sub>Built with ❤️ for the future of digital art · NexusNFT</sub>
</div>
