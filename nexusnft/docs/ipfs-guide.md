# IPFS & Metadata Guide

## Overview

IPFS (InterPlanetary File System) provides permanent, decentralized storage for NFT metadata and images. NexusNFT uses IPFS to ensure your NFTs remain accessible forever.

## Storage Options

### Pinata (Recommended)

[Pinata](https://pinata.cloud) offers a user-friendly IPFS pinning service with a generous free tier.

**Setup:**
1. Create account at https://pinata.cloud
2. Go to API Keys page
3. Generate JWT token with admin permissions
4. Add to `.env`:
```env
PINATA_JWT=your_jwt_token_here
```

**Free Tier:**
- 1 GB storage
- Unlimited pins
- 100,000 monthly API requests

### NFT.Storage (Alternative)

[NFT.Storage](https://nft.storage) is a free service specifically designed for NFT metadata.

**Setup:**
1. Create account at https://nft.storage
2. Get API key
3. Add to `.env`:
```env
NFT_STORAGE_API_KEY=your_api_key_here
```

**Free Tier:**
- No storage limits
- Filecoin-backed permanence

## Asset Preparation

### Image Requirements

| Property | Recommendation |
|----------|---------------|
| Size | 4096x4096px (square) |
| Format | PNG (lossless) |
| Max File | Under 50MB per file |
| Style | Consistent across collection |
| Naming | Sequential: `1.png`, `2.png`, etc. |

### Naming Convention

Images must be named sequentially starting from `1`:
```
assets/images/
├── 1.png
├── 2.png
├── 3.png
...
└── 100.png
```

## Upload Script

The `scripts/ipfs-upload.js` script automates the entire upload process.

### Prerequisites

1. Install dependencies:
```bash
npm install axios form-data
```

2. Set Pinata JWT in `.env`

3. Place images in `assets/images/`

4. Configure `TOTAL_NFTS` in the script (default: 100)

### Running

```bash
node scripts/ipfs-upload.js
```

### What it does

1. **Upload Images**: Each image is uploaded to IPFS via Pinata
2. **Generate Metadata**: Creates JSON metadata for each NFT with:
   - Name ("NexusNFT #1")
   - Description (collection description)
   - Image URI (IPFS link)
   - Attributes (Background, Rarity, Element)
3. **Upload Metadata**: Each metadata JSON is uploaded to IPFS
4. **Generate Unrevealed Metadata**: Placeholder for blind minting
5. **Save Results**: Deployment info saved to `deployments/ipfs/ipfs-info.json`

### Output

```json
{
  "collection": {
    "name": "NexusNFT",
    "description": "A collection of futuristic NFTs..."
  },
  "images": {
    "1": "QmX...",
    "2": "QmY..."
  },
  "metadata": {
    "1": "QmA...",
    "2": "QmB..."
  },
  "unrevealed": {
    "cid": "QmUnrevealed",
    "uri": "ipfs://QmUnrevealed"
  },
  "baseUri": "ipfs://QmBase/"
}
```

## Metadata Structure

### Token Metadata

Each NFT has the following metadata structure:

```json
{
  "name": "NexusNFT #1",
  "description": "A collection of futuristic Nexus NFTs...",
  "image": "ipfs://QmXx...imageCID",
  "external_url": "https://nexusnft.io/1",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Cyber Black"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    },
    {
      "trait_type": "Element",
      "value": "Fire"
    },
    {
      "trait_type": "Token ID",
      "value": 1,
      "display_type": "number"
    }
  ]
}
```

### Unrevealed Metadata

```json
{
  "name": "NexusNFT (Unrevealed)",
  "description": "This NFT has not been revealed yet...",
  "image": "ipfs://QmPlaceholderUnrevealedImage",
  "attributes": [
    {
      "trait_type": "Status",
      "value": "Unrevealed"
    }
  ]
}
```

## Integration with Contract

### Before Reveal

The contract's `notRevealedUri` should point to the unrevealed metadata:

```solidity
notRevealedUri = "ipfs://QmUnrevealedMetadataCID";
```

### After Reveal

When you call `reveal()`, the contract uses the base URI:

```solidity
baseUri = "ipfs://QmBaseMetadataCID/";
```

Token URIs become: `ipfs://QmBaseMetadataCID/1.json`, `ipfs://QmBaseMetadataCID/2.json`, etc.

## IPFS Gateways

Public gateways to view IPFS content:

| Gateway | URL Format |
|---------|------------|
| Pinata | `https://gateway.pinata.cloud/ipfs/{CID}` |
| IPFS.io | `https://ipfs.io/ipfs/{CID}` |
| NFTStorage | `https://nftstorage.link/ipfs/{CID}` |
| Cloudflare | `https://cf-ipfs.com/ipfs/{CID}` |

## Customization

### Changing Attributes

Edit the `generateMetadata()` function in `scripts/ipfs-upload.js`:

```javascript
const backgrounds = ["Cyber Black", "Neon Blue", ...];
const rarities = ["Common", "Uncommon", "Rare", ...];
const elements = ["Fire", "Water", "Earth", ...];
```

### Adding More Traits

```javascript
const expressions = ["Neutral", "Happy", "Mysterious"];
return {
  // ... existing fields
  attributes: [
    { trait_type: "Expression", value: expressions[elemIdx] },
    // ... other traits
  ],
};
```

## Filecoin Backup

For permanent storage, consider Filecoin deals:
1. Pinata offers automatic Filecoin deals on paid plans
2. NFT.Storage provides Filecoin storage by default
3. Web3.Storage provides Filecoin + IPFS

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check Pinata JWT is valid |
| Images not loading | Clear browser cache, try different gateway |
| Metadata not showing | Verify CID in contract matches uploaded CID |
| Slow uploads | Optimize images (smaller size, compression) |
