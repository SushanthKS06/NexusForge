# Deployment Guide

## Prerequisites

- **Node.js** v20+
- **pnpm** or **npm**
- **MetaMask** or compatible wallet with testnet ETH
- **Etherscan API key** (optional, for contract verification)
- **Private key** for deployment wallet

## Initial Setup

### 1. Install Dependencies

```bash
# Root project
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SEPOLIA_RPC_URL` — Alchemy or Infura RPC URL
- `PRIVATE_KEY` — Deployer wallet private key
- `ETHERSCAN_API_KEY` — For contract verification

## Deployment Workflow

### Step 1: Compile Contracts

```bash
npm run compile
```

### Step 2: Prepare IPFS Metadata

```bash
node scripts/ipfs-upload.js
```

This will:
1. Upload images from `assets/images/` to IPFS via Pinata
2. Generate and upload metadata JSON files
3. Generate collection-level metadata
4. Save deployment info to `deployments/ipfs/ipfs-info.json`

### Step 3: Generate Allowlist Merkle Root

```bash
node scripts/generate-merkle.js
```

Edit `scripts/generate-merkle.js` to include your allowlist addresses.

### Step 4: Deploy Contract

**Local Hardhat Node (for testing):**
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to local node
npm run deploy:local
```

**Sepolia Testnet:**
```bash
npm run deploy:sepolia
```

**Ethereum Mainnet:**
```bash
npm run deploy:mainnet
```

The deployment script will:
1. Validate configuration parameters
2. Deploy the contract with constructor arguments
3. Wait for block confirmations (testnets only)
4. Verify contract on Etherscan (automatic)
5. Save deployment info to `deployments/` directory

### Step 5: Post-Deployment Configuration

After deployment, execute these admin functions (via the admin panel or directly):

```bash
# Set allowlist Merkle root
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("NexusNFT", "YOUR_CONTRACT_ADDRESS");
> await contract.setMerkleRoot("YOUR_MERKLE_ROOT");

# Set unrevealed metadata URI
> await contract.setNotRevealedUri("ipfs://YOUR_UNREVEALED_CID");
```

### Step 6: Update Frontend

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_NETWORK_CHAIN_ID=11155111  # or 1 for mainnet
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
```

### Step 7: Deploy Frontend

```bash
cd frontend
npm run build
```

Deploy the `out/` directory to your hosting provider (Vercel, Netlify, etc.).

### Step 8: Reveal Collection

After minting is complete:

```bash
# Call reveal() with base metadata URI
> await contract.reveal("ipfs://YOUR_METADATA_CID/");
```

## Deployment Checklist

- [ ] Smart contracts compiled and tested
- [ ] IPFS images and metadata uploaded
- [ ] Merkle root generated for allowlist
- [ ] Contract deployed to target network
- [ ] Contract verified on Etherscan
- [ ] Merkle root set on contract
- [ ] Sale times configured
- [ ] Frontend environment updated
- [ ] Frontend deployed
- [ ] Collection revealed (after minting)

## Networks

### Localhost
- Chain ID: 31337
- RPC: http://127.0.0.1:8545

### Sepolia (Testnet)
- Chain ID: 11155111
- RPC: Use Alchemy/Infura
- ETH: Get free testnet ETH from faucets

### Ethereum Mainnet
- Chain ID: 1
- RPC: Use Alchemy/Infura
- ETH: Real ETH required

## Contract Verification

Etherscan verification happens automatically during deployment when `ETHERSCAN_API_KEY` is set.

Manual verification:
```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS \
  "TokenName" "SYMBOL" \
  10000 20 5 \
  50000000000000000 30000000000000000 \
  TIMESTAMP TIMESTAMP \
  "ipfs://uri" \
  RECEIVER_ADDRESS 750
```

## Production Readiness

1. **Audit**: Consider a professional audit before mainnet deployment
2. **Testing**: Run comprehensive tests on testnet first
3. **Gas**: Monitor gas costs and optimize if needed
4. **Monitoring**: Set up event monitoring for minting activity
5. **Backup**: Keep deployer wallet secure with multisig for production
6. **Documentation**: Update smart contract addresses in docs
