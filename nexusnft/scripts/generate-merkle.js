/**
 * Merkle Proof Generator for NexusNFT Allowlist
 * 
 * Usage: node scripts/generate-merkle.js
 * 
 * Creates a Merkle tree from a list of addresses and generates proofs for each.
 * Update the allowlist array with your wallet addresses before running.
 */

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");
const path = require("path");

// ============ ALLOWLIST ADDRESSES ============
// Replace these with actual allowlist addresses
const allowlist = [
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account #2
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat account #3
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Add your addresses here
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
];

// Generate leaf nodes (keccak256 of each address)
function encodeLeaf(address) {
  return Buffer.from(
    keccak256(Buffer.from(address.replace("0x", ""), "hex"))
  ).toString("hex");
}

console.log("Generating Merkle Tree...\n");
console.log("Addresses in allowlist:", allowlist.length);
console.log("─".repeat(60));

// Create Merkle Tree
const leafNodes = allowlist.map((addr) => keccak256(addr));
const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
const root = tree.getHexRoot();

console.log(`\nMerkle Root: ${root}\n`);

// Generate proofs for each address
const proofs = allowlist.map((addr) => {
  const leaf = keccak256(addr);
  const proof = tree.getHexProof(leaf);
  return {
    address: addr,
    proof: proof,
    isValid: tree.verify(proof, leaf, root),
  };
});

// Print proofs
proofs.forEach((p) => {
  console.log(`Address: ${p.address}`);
  console.log(`  Proof: ${JSON.stringify(p.proof)}`);
  console.log(`  Valid: ${p.isValid}`);
  console.log("");
});

// Save to file
const outputDir = path.join(__dirname, "..", "deployments");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "allowlist-proofs.json");
const outputData = {
  merkleRoot: root,
  proofs: proofs,
  generatedAt: new Date().toISOString(),
  totalAddresses: allowlist.length,
};

fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
console.log(`Allowlist proofs saved to: ${outputPath}\n`);
console.log("Done! Use the merkleRoot above when calling setMerkleRoot()");
console.log("Include the proofs in your frontend for allowlist minting\n");
