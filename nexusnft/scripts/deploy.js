const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying NexusNFT...\n");

  // ============ Deployment Configuration ============
  const config = {
    // Contract parameters
    name: "NexusNFT",
    symbol: "NEXUS",
    maxSupply: 10000,
    maxMintPerWallet: 20,
    allowlistMintLimit: 5,
    
    // Prices in wei (0.05 ETH public, 0.03 ETH allowlist)
    publicPrice: ethers.parseEther("0.05"),
    allowlistPrice: ethers.parseEther("0.03"),
    
    // Timestamps (Unix timestamps)
    // Allowlist starts now, public starts 24 hours later
    allowlistStartTime: Math.floor(Date.now() / 1000),
    publicStartTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    
    // URIs
    notRevealedUri: "ipfs://QmPlaceholderNotRevealed",
    baseUri: "", // Set after reveal
    
    // Royalty
    royaltyReceiver: (await ethers.getSigners())[0].address,
    royaltyBps: 750, // 7.5%
    
    // Merkle root (empty initially - set via setMerkleRoot)
    merkleRoot: ethers.ZeroHash,
  };

  // Validate config
  if (config.maxSupply > 10000) throw new Error("Max supply exceeds 10000");
  if (config.maxMintPerWallet > 20) throw new Error("Max mint per wallet exceeds 20");
  if (config.allowlistMintLimit > 5) throw new Error("Allowlist mint limit exceeds 5");

  console.log("Deployment Configuration:");
  console.log("─".repeat(50));
  console.log(`Name: ${config.name}`);
  console.log(`Symbol: ${config.symbol}`);
  console.log(`Max Supply: ${config.maxSupply}`);
  console.log(`Max Mint/Wallet: ${config.maxMintPerWallet}`);
  console.log(`Allowlist Mint Limit: ${config.allowlistMintLimit}`);
  console.log(`Public Price: ${ethers.formatEther(config.publicPrice)} ETH`);
  console.log(`Allowlist Price: ${ethers.formatEther(config.allowlistPrice)} ETH`);
  console.log(`Allowlist Start: ${new Date(config.allowlistStartTime * 1000).toISOString()}`);
  console.log(`Public Start: ${new Date(config.publicStartTime * 1000).toISOString()}`);
  console.log(`Royalty: ${config.royaltyBps / 100}% to ${config.royaltyReceiver}`);
  console.log("─".repeat(50) + "\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await deployer.getBalance())} ETH\n`);

  // Deploy contract
  console.log("Deploying contract...");
  const NexusNFT = await ethers.getContractFactory("NexusNFT");
  
  const contract = await NexusNFT.deploy(
    config.name,
    config.symbol,
    config.maxSupply,
    config.maxMintPerWallet,
    config.allowlistMintLimit,
    config.publicPrice,
    config.allowlistPrice,
    config.allowlistStartTime,
    config.publicStartTime,
    config.notRevealedUri,
    config.royaltyReceiver,
    config.royaltyBps
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`Contract deployed to: ${contractAddress}`);
  console.log(`Transaction: ${contract.deploymentTransaction().hash}\n`);

  // Verify on Etherscan if not local network
  const network = hre.network.name;
  if (network !== "hardhat" && network !== "localhost") {
    console.log("Waiting for block confirmations...");
    await contract.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          config.name,
          config.symbol,
          config.maxSupply,
          config.maxMintPerWallet,
          config.allowlistMintLimit,
          config.publicPrice,
          config.allowlistPrice,
          config.allowlistStartTime,
          config.publicStartTime,
          config.notRevealedUri,
          config.royaltyReceiver,
          config.royaltyBps,
        ],
      });
      console.log("Contract verified on Etherscan\n");
    } catch (error) {
      console.log(`Verification failed: ${error.message}\n`);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network,
    contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: (await ethers.provider.getBlock("latest")).number,
    transactionHash: contract.deploymentTransaction().hash,
    config,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentFile}\n`);

  // Print summary
  console.log("═".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("═".repeat(50));
  console.log(`Contract: ${contractAddress}`);
  console.log(`Network: ${network}`);
  console.log(`Explorer: ${getExplorerUrl(network, contractAddress)}`);
  console.log("═".repeat(50));

  // Post-deployment instructions
  console.log("\nNEXT STEPS:");
  console.log("1. Upload unrevealed metadata to IPFS and update notRevealedUri");
  console.log("2. Generate Merkle root for allowlist and call setMerkleRoot()");
  console.log("3. When ready, upload revealed metadata to IPFS and call reveal()");
  console.log("4. Verify contract on Etherscan if not done automatically");
  console.log("5. Update frontend with contract address and ABI\n");
}

function getExplorerUrl(network, address) {
  const explorers = {
    sepolia: `https://sepolia.etherscan.io/address/${address}`,
    mainnet: `https://etherscan.io/address/${address}`,
    localhost: `http://localhost:8545`,
  };
  return explorers[network] || "Unknown network";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
