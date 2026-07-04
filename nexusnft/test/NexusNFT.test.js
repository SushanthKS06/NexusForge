const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("NexusNFT", function () {
  let nexusNFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let allowlistAddresses;

  const NAME = "NexusNFT";
  const SYMBOL = "NEXUS";
  const MAX_SUPPLY = 100;
  const MAX_MINT_PER_WALLET = 5;
  const ALLOWLIST_MINT_LIMIT = 3;
  const PUBLIC_PRICE = ethers.parseEther("0.05");
  const ALLOWLIST_PRICE = ethers.parseEther("0.03");
  const ROYALTY_BPS = 750;

  let merkleTree;
  let merkleRoot;
  let allowlistStartTime;
  let publicStartTime;
  let notRevealedUri;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    allowlistAddresses = [addr1.address, addr2.address, addr3.address];

    // Generate Merkle tree
    const leafNodes = allowlistAddresses.map((addr) =>
      keccak256(abi.encodePacked(addr))
    );
    merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getHexRoot();

    allowlistStartTime = Math.floor(Date.now() / 1000);
    publicStartTime = allowlistStartTime + 3600; // 1 hour later
    notRevealedUri = "ipfs://placeholder";

    const NexusNFT = await ethers.getContractFactory("NexusNFT");
    nexusNFT = await NexusNFT.deploy(
      NAME,
      SYMBOL,
      MAX_SUPPLY,
      MAX_MINT_PER_WALLET,
      ALLOWLIST_MINT_LIMIT,
      PUBLIC_PRICE,
      ALLOWLIST_PRICE,
      allowlistStartTime,
      publicStartTime,
      notRevealedUri,
      owner.address,
      ROYALTY_BPS
    );

    await nexusNFT.waitForDeployment();

    // Set merkle root
    await nexusNFT.setMerkleRoot(merkleRoot);
  });

  // Helper function for abi.encodePacked
  function abi.encodePacked(...args) {
    return ethers.solidityPacked(["address"], args);
  }

  function getAllowlistProof(address) {
    const leaf = keccak256(abi.encodePacked(address));
    return merkleTree.getHexProof(leaf);
  }

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await nexusNFT.name()).to.equal(NAME);
      expect(await nexusNFT.symbol()).to.equal(SYMBOL);
    });

    it("should set correct max supply", async function () {
      expect(await nexusNFT.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("should set correct max mint per wallet", async function () {
      expect(await nexusNFT.maxMintPerWallet()).to.equal(MAX_MINT_PER_WALLET);
    });

    it("should set correct allowlist mint limit", async function () {
      expect(await nexusNFT.allowlistMintLimit()).to.equal(ALLOWLIST_MINT_LIMIT);
    });

    it("should set correct prices", async function () {
      expect(await nexusNFT.publicPrice()).to.equal(PUBLIC_PRICE);
      expect(await nexusNFT.allowlistPrice()).to.equal(ALLOWLIST_PRICE);
    });

    it("should set correct sale times", async function () {
      expect(await nexusNFT.allowlistStartTime()).to.equal(allowlistStartTime);
      expect(await nexusNFT.publicStartTime()).to.equal(publicStartTime);
    });

    it("should set correct royalty", async function () {
      const royaltyInfo = await nexusNFT.royaltyInfo(1, 10000);
      expect(royaltyInfo[0]).to.equal(owner.address);
      expect(royaltyInfo[1]).to.equal(750);
    });

    it("should be owned by deployer", async function () {
      expect(await nexusNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Allowlist Minting", function () {
    it("should allow allowlisted address to mint", async function () {
      const proof = getAllowlistProof(addr1.address);
      await nexusNFT.connect(addr1).mintAllowlist(2, proof, {
        value: ALLOWLIST_PRICE * 2n,
      });
      expect(await nexusNFT.totalSupply()).to.equal(2);
      expect(await nexusNFT.mintedPerWallet(addr1.address)).to.equal(2);
    });

    it("should reject non-allowlisted address", async function () {
      const invalidProof = getAllowlistProof(owner.address);
      await expect(
        nexusNFT.connect(addr1).mintAllowlist(1, invalidProof, {
          value: ALLOWLIST_PRICE,
        })
      ).to.be.revertedWithCustomError(nexusNFT, "InvalidMerkleProof");
    });

    it("should enforce allowlist mint limit", async function () {
      const proof = getAllowlistProof(addr1.address);
      await nexusNFT.connect(addr1).mintAllowlist(3, proof, {
        value: ALLOWLIST_PRICE * 3n,
      });
      await expect(
        nexusNFT.connect(addr1).mintAllowlist(1, proof, {
          value: ALLOWLIST_PRICE,
        })
      ).to.be.revertedWithCustomError(nexusNFT, "MaxMintPerWalletExceeded");
    });

    it("should enforce payment", async function () {
      const proof = getAllowlistProof(addr1.address);
      await expect(
        nexusNFT.connect(addr1).mintAllowlist(1, proof, {
          value: ALLOWLIST_PRICE - 1n,
        })
      ).to.be.revertedWithCustomError(nexusNFT, "InsufficientPayment");
    });

    it("should allow multiple allowlist mints within limit", async function () {
      const proof = getAllowlistProof(addr1.address);
      await nexusNFT.connect(addr1).mintAllowlist(2, proof, {
        value: ALLOWLIST_PRICE * 2n,
      });
      expect(await nexusNFT.totalSupply()).to.equal(2);
      await nexusNFT.connect(addr1).mintAllowlist(1, proof, {
        value: ALLOWLIST_PRICE,
      });
      expect(await nexusNFT.totalSupply()).to.equal(3);
    });

    it("should reject minting after allowlist ends", async function () {
      await ethers.provider.send("evm_increaseTime", [7200]);
      await ethers.provider.send("evm_mine", []);
      const proof = getAllowlistProof(addr1.address);
      await expect(
        nexusNFT.connect(addr1).mintAllowlist(1, proof, {
          value: ALLOWLIST_PRICE,
        })
      ).to.be.revertedWithCustomError(nexusNFT, "SaleNotActive");
    });
  });

  describe("Public Minting", function () {
    beforeEach(async function () {
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
    });

    it("should allow public minting", async function () {
      await nexusNFT.connect(addr1).mintPublic(1, {
        value: PUBLIC_PRICE,
      });
      expect(await nexusNFT.totalSupply()).to.equal(1);
    });

    it("should enforce public mint price", async function () {
      await expect(
        nexusNFT.connect(addr1).mintPublic(1, {
          value: PUBLIC_PRICE - 1n,
        })
      ).to.be.revertedWithCustomError(nexusNFT, "InsufficientPayment");
    });

    it("should enforce max mint per wallet", async function () {
      const max = await nexusNFT.maxMintPerWallet();
      await nexusNFT.connect(addr1).mintPublic(max, {
        value: PUBLIC_PRICE * BigInt(max),
      });
      await expect(
        nexusNFT.connect(addr1).mintPublic(1, {
          value: PUBLIC_PRICE,
        })
      ).to.be.revertedWithCustomError(nexusNFT, "MaxMintPerWalletExceeded");
    });

    it("should enforce max supply", async function () {
      const supply = await nexusNFT.maxSupply();
      for (let i = 0; i < supply / 5n; i++) {
        const signer = (await ethers.getSigners())[i + 1];
        await nexusNFT.connect(signer).mintPublic(5, {
          value: PUBLIC_PRICE * 5n,
        });
      }
      const remaining = Number(supply) % 5;
      if (remaining > 0) {
        const lastSigner = (await ethers.getSigners())[Number(supply) / 5 + 1];
        await nexusNFT.connect(lastSigner).mintPublic(remaining, {
          value: PUBLIC_PRICE * BigInt(remaining),
        });
      }
      await expect(
        nexusNFT.connect(owner).mintPublic(1, { value: PUBLIC_PRICE })
      ).to.be.revertedWithCustomError(nexusNFT, "MaxSupplyExceeded");
    });

    it("should allow batch minting", async function () {
      await nexusNFT.connect(addr2).mintPublic(3, {
        value: PUBLIC_PRICE * 3n,
      });
      expect(await nexusNFT.totalSupply()).to.equal(3);
    });
  });

  describe("Reveal Mechanism", function () {
    it("should start with notRevealedUri", async function () {
      await nexusNFT.connect(addr1).mintAllowlist(
        1,
        getAllowlistProof(addr1.address),
        { value: ALLOWLIST_PRICE }
      );
      const uri = await nexusNFT.tokenURI(1);
      expect(uri).to.equal(notRevealedUri);
    });

    it("should allow owner to reveal", async function () {
      const baseUri = "ipfs://QmTest/";
      await nexusNFT.reveal(baseUri);
      expect(await nexusNFT.isRevealed()).to.equal(true);
    });

    it("should update token URIs after reveal", async function () {
      await nexusNFT.connect(addr1).mintAllowlist(
        1,
        getAllowlistProof(addr1.address),
        { value: ALLOWLIST_PRICE }
      );
      const baseUri = "ipfs://QmTest/";
      await nexusNFT.reveal(baseUri);
      const uri = await nexusNFT.tokenURI(1);
      expect(uri).to.equal(baseUri + "1.json");
    });

    it("should not allow double reveal", async function () {
      await nexusNFT.reveal("ipfs://QmTest/");
      await expect(
        nexusNFT.reveal("ipfs://QmTest2/")
      ).to.be.revertedWithCustomError(nexusNFT, "AlreadyRevealed");
    });

    it("should not allow non-owner to reveal", async function () {
      await expect(
        nexusNFT.connect(addr1).reveal("ipfs://QmTest/")
      ).to.be.revertedWithCustomError(nexusNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Admin Functions", function () {
    it("should allow owner to set prices", async function () {
      const newPrice = ethers.parseEther("0.1");
      await nexusNFT.setPublicPrice(newPrice);
      expect(await nexusNFT.publicPrice()).to.equal(newPrice);

      const newAllowlistPrice = ethers.parseEther("0.08");
      await nexusNFT.setAllowlistPrice(newAllowlistPrice);
      expect(await nexusNFT.allowlistPrice()).to.equal(newAllowlistPrice);
    });

    it("should allow owner to set sale times", async function () {
      const newAllowlistStart = allowlistStartTime + 86400;
      const newPublicStart = allowlistStartTime + 172800;
      await nexusNFT.setSaleTimes(newAllowlistStart, newPublicStart);
      expect(await nexusNFT.allowlistStartTime()).to.equal(newAllowlistStart);
      expect(await nexusNFT.publicStartTime()).to.equal(newPublicStart);
    });

    it("should allow owner to set merkle root", async function () {
      const newRoot = ethers.hexlify(ethers.randomBytes(32));
      await nexusNFT.setMerkleRoot(newRoot);
      expect(await nexusNFT.allowlistMerkleRoot()).to.equal(newRoot);
    });

    it("should allow owner to pause and unpause", async function () {
      await nexusNFT.setPaused(true);
      expect(await nexusNFT.paused()).to.equal(true);
      
      await nexusNFT.setPaused(false);
      expect(await nexusNFT.paused()).to.equal(false);
    });

    it("should reject minting when paused", async function () {
      await nexusNFT.setPaused(true);
      await expect(
        nexusNFT.connect(addr1).mintAllowlist(
          1,
          getAllowlistProof(addr1.address),
          { value: ALLOWLIST_PRICE }
        )
      ).to.be.revertedWithCustomError(nexusNFT, "EnforcedPause");
    });

    it("should reject non-owner admin actions", async function () {
      await expect(
        nexusNFT.connect(addr1).setPublicPrice(ethers.parseEther("0.1"))
      ).to.be.revertedWithCustomError(nexusNFT, "OwnableUnauthorizedAccount");
      
      await expect(
        nexusNFT.connect(addr1).setMerkleRoot(ethers.hexlify(ethers.randomBytes(32)))
      ).to.be.revertedWithCustomError(nexusNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Withdrawal", function () {
    it("should allow owner to withdraw", async function () {
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
      
      await nexusNFT.connect(addr1).mintPublic(1, {
        value: PUBLIC_PRICE,
      });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await nexusNFT.withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.equal(initialBalance - gasCost + PUBLIC_PRICE);
    });
  });

  describe("View Functions", function () {
    it("should return total minted", async function () {
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
      
      await nexusNFT.connect(addr1).mintPublic(2, {
        value: PUBLIC_PRICE * 2n,
      });
      expect(await nexusNFT.getTotalMinted()).to.equal(2);
    });

    it("should return remaining supply", async function () {
      expect(await nexusNFT.getRemainingSupply()).to.equal(MAX_SUPPLY);
    });

    it("should return correct sale phase", async function () {
      expect(await nexusNFT.getSalePhase()).to.equal(1); // allowlist
      
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
      expect(await nexusNFT.getSalePhase()).to.equal(2); // public
      
      // Mint all and reveal
      const signers = await ethers.getSigners();
      for (let i = 0; i < 20; i++) {
        await nexusNFT.connect(signers[i + 1]).mintPublic(5, {
          value: PUBLIC_PRICE * 5n,
        });
      }
      await nexusNFT.reveal("ipfs://QmTest/");
      expect(await nexusNFT.getSalePhase()).to.equal(3); // ended
    });
  });

  describe("Royalties", function () {
    it("should return default royalty info", async function () {
      const [receiver, amount] = await nexusNFT.royaltyInfo(1, 10000);
      expect(receiver).to.equal(owner.address);
      expect(amount).to.equal(750);
    });

    it("should allow owner to set token-specific royalty", async function () {
      await nexusNFT.connect(addr1).mintAllowlist(
        1,
        getAllowlistProof(addr1.address),
        { value: ALLOWLIST_PRICE }
      );
      
      await nexusNFT.setTokenRoyalty(1, addr2.address, 500);
      const [receiver, amount] = await nexusNFT.royaltyInfo(1, 10000);
      expect(receiver).to.equal(addr2.address);
      expect(amount).to.equal(500);
    });
  });

  describe("Edge Cases", function () {
    it("should handle max supply edge case", async function () {
      const supply = await nexusNFT.maxSupply();
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
      
      // Mint close to max
      const batchSize = 5;
      const signers = await ethers.getSigners();
      for (let i = 0; i < Number(supply) / batchSize; i++) {
        await nexusNFT.connect(signers[i + 1]).mintPublic(batchSize, {
          value: PUBLIC_PRICE * BigInt(batchSize),
        });
      }
      expect(await nexusNFT.totalSupply()).to.equal(supply);
    });

    it("should not allow minting zero quantity", async function () {
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
      
      await expect(
        nexusNFT.connect(addr1).mintPublic(0, { value: 0 })
      ).to.be.revertedWithCustomError(nexusNFT, "InvalidQuantity");
    });

    it("should not allow non-owner to withdraw", async function () {
      await expect(
        nexusNFT.connect(addr1).withdraw()
      ).to.be.revertedWithCustomError(nexusNFT, "OwnableUnauthorizedAccount");
    });
  });
});