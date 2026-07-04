/**
 * IPFS Metadata & Image Upload Script
 * 
 * This script uploads NFT images and generates metadata JSON files,
 * then uploads everything to IPFS via Pinata.
 * 
 * Usage: node scripts/ipfs-upload.js
 * 
 * Prerequisites:
 * 1. Create a Pinata account (https://pinata.cloud)
 * 2. Get your API keys from Pinata dashboard
 * 3. Add keys to .env file
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

// ============ CONFIGURATION ============
const IMAGES_DIR = path.join(__dirname, "..", "assets", "images");
const METADATA_DIR = path.join(__dirname, "..", "assets", "metadata");
const OUTPUT_DIR = path.join(__dirname, "..", "deployments", "ipfs");

// NFT Collection Info
const COLLECTION = {
  name: "NexusNFT",
  description: "A collection of futuristic Nexus NFTs — each one a gateway to the digital frontier.",
  external_url: "https://nexusnft.io",
};

// Pinata API - store files
const PINATA_BASE_URL = "https://api.pinata.cloud";
const PINATA_JWT = process.env.PINATA_JWT || "";

// Number of NFTs to generate
const TOTAL_NFTS = 100; // Change to your collection size

/**
 * Upload file to IPFS via Pinata
 */
async function uploadToIPFS(filePath, fileName) {
  const url = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
  
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), fileName);
  
  // Pin metadata
  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      collection: COLLECTION.name,
      type: path.extname(filePath).slice(1),
    },
  });
  formData.append("pinataMetadata", metadata);
  
  // Pin policy
  const pinPolicy = JSON.stringify({
    regions: [
      { id: "FRA1", desiredReplicationCount: 2 },
      { id: "NYC1", desiredReplicationCount: 2 },
    ],
  });
  formData.append("pinataOptions", pinPolicy);

  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error(`Upload failed for ${fileName}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 */
async function uploadJSONToIPFS(jsonData, fileName) {
  const url = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;
  
  const payload = {
    pinataMetadata: {
      name: fileName,
      keyvalues: {
        collection: COLLECTION.name,
        type: "metadata",
      },
    },
    pinataOptions: {
      cidVersion: 1,
    },
    pinataContent: jsonData,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error(`JSON upload failed for ${fileName}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Generate metadata JSON for each NFT
 */
function generateMetadata(tokenId, imageCid) {
  const imageUri = `ipfs://${imageCid}`;
  
  // Number of possible attributes - feel free to customize
  const backgrounds = ["Cyber Black", "Neon Blue", "Matrix Green", "Void Purple", "Digital Red"];
  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
  const elements = ["Fire", "Water", "Earth", "Air", "Void", "Electric", "Crystal"];
  
  // Deterministic "random" selection based on tokenId
  const bgIdx = tokenId % backgrounds.length;
  const rarityIdx = Math.floor(tokenId / backgrounds.length) % rarities.length;
  const elemIdx = Math.floor(tokenId / (backgrounds.length * rarities.length)) % elements.length;

  return {
    name: `NexusNFT #${tokenId}`,
    description: COLLECTION.description,
    image: imageUri,
    external_url: `${COLLECTION.external_url}/${tokenId}`,
    attributes: [
      {
        trait_type: "Background",
        value: backgrounds[bgIdx],
      },
      {
        trait_type: "Rarity",
        value: rarities[rarityIdx],
      },
      {
        trait_type: "Element",
        value: elements[elemIdx],
      },
      {
        trait_type: "Token ID",
        value: tokenId,
        display_type: "number",
      },
    ],
  };
}

/**
 * Main function
 */
async function main() {
  console.log("NexusNFT IPFS Upload Script\n");
  
  // Validate JWT
  if (!PINATA_JWT) {
    console.error("PINATA_JWT not set! Please configure .env file.");
    console.log("\nGet your JWT at https://app.pinata.cloud/developers/api-keys");
    process.exit(1);
  }
  
  // Create directories if they don't exist
  [IMAGES_DIR, METADATA_DIR, OUTPUT_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log("Directories checked/created\n");

  // Step 1: Upload images
  console.log("STEP 1: Uploading images to IPFS...");
  console.log("─".repeat(50));
  
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => 
    /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f)
  );

  if (imageFiles.length === 0) {
    console.log("No image files found. Place your images in assets/images/ folder.");
    console.log(`   Expected files: 1.png, 2.png, ..., ${TOTAL_NFTS}.png`);
    console.log("   Creating placeholder metadata script...\n");
    
    // Create placeholder images guide
    const guidePath = path.join(METADATA_DIR, "..", "ASSET_GUIDE.md");
    fs.writeFileSync(guidePath, `# Asset Guide

## Images
Place your NFT images in \`assets/images/\` with sequential naming:
- 1.png, 2.png, 3.png, ..., ${TOTAL_NFTS}.png
- Recommended size: 4096x4096px (square)
- Format: PNG for lossless quality

## Collections
You can use these tools to generate images:
1. **DALL-E / Midjourney** - AI-generated art
2. **Pixel art editors** - Aseprite, Piskel
3. **3D software** - Blender, Cinema 4D
4. **Generative art** - p5.js, Processing

## Requirements
- ${TOTAL_NFTS} unique images
- High resolution (min 1024x1024)
- Consistent style across collection
- No watermarks or signatures
`);
    console.log(`Created asset guide at ${guidePath}\n`);
    return;
  }

  const imageCids = {};
  
  for (let i = 0; i < Math.min(imageFiles.length, TOTAL_NFTS); i++) {
    const fileName = imageFiles[i];
    const filePath = path.join(IMAGES_DIR, fileName);
    console.log(`  Uploading ${fileName}... (${i + 1}/${Math.min(imageFiles.length, TOTAL_NFTS)})`);
    
    const cid = await uploadToIPFS(filePath, fileName);
    if (cid) {
      const tokenId = parseInt(fileName.replace(/\.[^/.]+$/, ""));
      imageCids[tokenId] = cid;
      console.log(`  Uploaded! CID: ${cid}`);
    }
  }

  console.log("\n Image upload complete!\n");

  // Step 2: Generate and upload metadata
  console.log("STEP 2: Generating and uploading metadata...");
  console.log("─".repeat(50));

  const metadataCids = {};
  
  for (const tokenIdStr in imageCids) {
    const tokenId = parseInt(tokenIdStr);
    const metadata = generateMetadata(tokenId, imageCids[tokenIdStr]);
    
    // Save locally
    const metadataPath = path.join(METADATA_DIR, `${tokenId}`);
    if (!fs.existsSync(metadataPath)) {
      fs.mkdirSync(metadataPath, { recursive: true });
    }
    fs.writeFileSync(
      path.join(metadataPath, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );
    
    // Upload to IPFS
    const fileName = `${tokenId}`;
    console.log(`  Uploading metadata for #${tokenId}...`);
    const cid = await uploadJSONToIPFS(metadata, fileName);
    if (cid) {
      metadataCids[tokenId] = cid;
      console.log(`  Uploaded! CID: ${cid}`);
    }
  }

  // Step 3: Generate and upload collection metadata
  console.log("\n STEP 3: Generating collection metadata...");
  console.log("─".repeat(50));

  // Generate the "unrevealed" placeholder metadata
  const unrevealedMetadata = {
    name: "NexusNFT (Unrevealed)",
    description: "This NFT has not been revealed yet. Come back later to see what it is!",
    image: "ipfs://QmPlaceholderUnrevealedImage",
    attributes: [
      {
        trait_type: "Status",
        value: "Unrevealed",
      },
    ],
  };

  const unrevealedCid = await uploadJSONToIPFS(unrevealedMetadata, "unrevealed");
  console.log(`  Unrevealed metadata CID: ${unrevealedCid || "Failed"}`);

  // Step 4: Save deployment info
  console.log("\n STEP 4: Saving deployment info...");
  console.log("─".repeat(50));

  const ipfsInfo = {
    collection: COLLECTION,
    images: imageCids,
    metadata: metadataCids,
    unrevealed: {
      cid: unrevealedCid,
      uri: `ipfs://${unrevealedCid}`,
    },
    baseUri: `ipfs://${Object.values(metadataCids)[0]?.replace(/\d+$/, "") || ""}`,
    totalUploaded: Object.keys(imageCids).length,
    timestamp: new Date().toISOString(),
  };

  const infoPath = path.join(OUTPUT_DIR, "ipfs-info.json");
  fs.writeFileSync(infoPath, JSON.stringify(ipfsInfo, null, 2));
  console.log(`  Saved to ${infoPath}`);

  console.log("\n" + "═".repeat(50));
  console.log(" IPFS UPLOAD COMPLETE");
  console.log("═".repeat(50));
  
  // Summary
  console.log("\n DEPLOYMENT INFORMATION");
  console.log(`  Contract base URI: ${ipfsInfo.baseUri}`);
  console.log(`  Unrevealed URI: ${ipfsInfo.unrevealed.uri}`);
  console.log(`  Total NFTs: ${Object.keys(imageCids).length}`);
  console.log("\n NEXT STEPS:");
  console.log("  1. Update contract's notRevealedUri with unrevealed metadata URI");
  console.log("  2. Deploy contract");
  console.log("  3. After minting ends, call reveal() with base metadata URI");
  console.log("  4. Update frontend with IPFS gateway URLs\n");
}

main().catch(console.error);
