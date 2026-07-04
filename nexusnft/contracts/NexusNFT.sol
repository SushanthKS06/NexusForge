// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "erc721a/contracts/ERC721A.sol";

/**
 * @title NexusNFT
 * @notice ERC-721A NFT collection with gas-optimized minting, reveal mechanism,
 *         royalty support, allowlist via Merkle Proof, and comprehensive access controls.
 * @dev Uses ERC721A for batch gas savings, Ownable for admin, ReentrancyGuard
 *      for security, Pausable for emergency stops, and ERC2981 for royalties.
 * @author NexusNFT Team
 */
contract NexusNFT is ERC721A, Ownable, ReentrancyGuard, Pausable, ERC2981 {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Maximum possible supply (hard cap)
    uint256 public constant MAX_SUPPLY = 10000;

    /// @notice Maximum tokens one wallet can mint in public sale
    uint256 public constant MAX_MINT_PER_WALLET = 20;

    /// @notice Default royalty in basis points (7.5%)
    uint256 public constant DEFAULT_ROYALTY_BPS = 750;

    /// @notice Maximum tokens one wallet can mint in allowlist
    uint256 public constant ALLOWLIST_MINT_LIMIT = 5;

    // ============ Immutable State ============

    /// @notice Collection max supply (set at construction, ≤ MAX_SUPPLY)
    uint256 public immutable maxSupply;

    /// @notice Max mints per wallet during public sale
    uint256 public immutable maxMintPerWallet;

    /// @notice Max mints per allowlisted wallet
    uint256 public immutable allowlistMintLimit;

    // ============ Mutable State ============

    /// @notice Current public mint price in wei
    uint256 public publicPrice;

    /// @notice Current allowlist mint price in wei
    uint256 public allowlistPrice;

    /// @notice Unix timestamp when allowlist sale starts
    uint256 public allowlistStartTime;

    /// @notice Unix timestamp when public sale starts
    uint256 public publicStartTime;

    /// @notice Merkle root of allowlist tree
    bytes32 public allowlistMerkleRoot;

    /// @notice Whether metadata has been revealed
    bool public isRevealed;

    /// @notice URI for unrevealed token metadata
    string public notRevealedUri;

    /// @notice Base URI for revealed token metadata
    string public baseUri;

    /// @notice File extension for metadata URIs (default ".json")
    string public baseExtension = ".json";

    /// @notice Track mints per wallet address
    mapping(address => uint256) public mintedPerWallet;

    /// @notice Track allowlist usage per address
    mapping(address => bool) public isAllowlisted;

    // ============ Events ============

    /// @notice Emitted when mint or allowlist price changes
    event PriceUpdated(uint256 indexed price, bool isAllowlist);

    /// @notice Emitted when sale timestamps are updated
    event SaleTimesUpdated(uint256 allowlistStart, uint256 publicStart);

    /// @notice Emitted when the Merkle root is updated
    event MerkleRootUpdated(bytes32 indexed merkleRoot);

    /// @notice Emitted when the collection is revealed
    event Revealed(string baseUri);

    /// @notice Emitted on every mint
    event NFTMinted(address indexed minter, uint256 quantity, bool isAllowlist);

    /// @notice Emitted when ETH is withdrawn
    event Withdrawal(address indexed recipient, uint256 amount);

    // ============ Custom Errors ============

    error MaxSupplyExceeded();
    error MaxMintPerWalletExceeded();
    error InsufficientPayment();
    error SaleNotActive();
    error InvalidMerkleProof();
    error NotAllowlisted();
    error AlreadyRevealed();
    error NotRevealedYet();
    error ZeroAddress();
    error InvalidRoyaltyReceiver();
    error InvalidQuantity();

    // ============ Constructor ============

    /**
     * @notice Initializes the NexusNFT collection
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param maxSupply_ Maximum supply (must be 1-10000)
     * @param maxMintPerWallet_ Max public mints per wallet (1-20)
     * @param allowlistMintLimit_ Max allowlist mints per wallet (1-5)
     * @param publicPrice_ Public mint price in wei
     * @param allowlistPrice_ Allowlist mint price in wei
     * @param allowlistStartTime_ Allowlist sale start (Unix timestamp)
     * @param publicStartTime_ Public sale start (Unix timestamp)
     * @param notRevealedUri_ URI for unrevealed token metadata
     * @param royaltyReceiver_ Address to receive ERC-2981 royalties
     * @param royaltyBps_ Royalty basis points (e.g. 750 = 7.5%)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 maxMintPerWallet_,
        uint256 allowlistMintLimit_,
        uint256 publicPrice_,
        uint256 allowlistPrice_,
        uint256 allowlistStartTime_,
        uint256 publicStartTime_,
        string memory notRevealedUri_,
        address royaltyReceiver_,
        uint256 royaltyBps_
    ) ERC721A(name_, symbol_) Ownable(msg.sender) {
        if (maxSupply_ == 0 || maxSupply_ > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (maxMintPerWallet_ == 0 || maxMintPerWallet_ > MAX_MINT_PER_WALLET) revert MaxMintPerWalletExceeded();
        if (allowlistMintLimit_ == 0 || allowlistMintLimit_ > ALLOWLIST_MINT_LIMIT) revert MaxMintPerWalletExceeded();
        if (royaltyReceiver_ == address(0)) revert ZeroAddress();

        maxSupply = maxSupply_;
        maxMintPerWallet = maxMintPerWallet_;
        allowlistMintLimit = allowlistMintLimit_;
        publicPrice = publicPrice_;
        allowlistPrice = allowlistPrice_;
        allowlistStartTime = allowlistStartTime_;
        publicStartTime = publicStartTime_;
        notRevealedUri = notRevealedUri_;

        _setDefaultRoyalty(royaltyReceiver_, royaltyBps_);
    }

    // ============ Mint Functions ============

    /**
     * @notice Allowlist mint with Merkle proof verification
     * @param quantity Number of tokens to mint
     * @param merkleProof Merkle proof that sender is allowlisted
     */
    function mintAllowlist(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant whenNotPaused {
        if (quantity == 0) revert InvalidQuantity();
        _validateAllowlistMint(quantity, merkleProof);
        _mint(msg.sender, quantity);
        _updateMintState(msg.sender, quantity, true);
        emit NFTMinted(msg.sender, quantity, true);
    }

    /**
     * @notice Public mint
     * @param quantity Number of tokens to mint
     */
    function mintPublic(
        uint256 quantity
    ) external payable nonReentrant whenNotPaused {
        if (quantity == 0) revert InvalidQuantity();
        _validatePublicMint(quantity);
        _mint(msg.sender, quantity);
        _updateMintState(msg.sender, quantity, false);
        emit NFTMinted(msg.sender, quantity, false);
    }

    // ============ Internal Validation ============

    /**
     * @dev Validates allowlist mint conditions
     */
    function _validateAllowlistMint(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) internal view {
        if (block.timestamp < allowlistStartTime || block.timestamp >= publicStartTime) revert SaleNotActive();

        uint256 maxMint = isAllowlisted[msg.sender]
            ? allowlistMintLimit
            : maxMintPerWallet;
        if (mintedPerWallet[msg.sender] + quantity > maxMint)
            revert MaxMintPerWalletExceeded();
        if (_totalMinted() + quantity > maxSupply) revert MaxSupplyExceeded();
        if (msg.value < allowlistPrice * quantity) revert InsufficientPayment();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, allowlistMerkleRoot, leaf))
            revert InvalidMerkleProof();
    }

    /**
     * @dev Validates public mint conditions
     */
    function _validatePublicMint(uint256 quantity) internal view {
        if (block.timestamp < publicStartTime) revert SaleNotActive();

        uint256 maxMint = isAllowlisted[msg.sender]
            ? allowlistMintLimit
            : maxMintPerWallet;
        if (mintedPerWallet[msg.sender] + quantity > maxMint)
            revert MaxMintPerWalletExceeded();
        if (_totalMinted() + quantity > maxSupply) revert MaxSupplyExceeded();
        if (msg.value < publicPrice * quantity) revert InsufficientPayment();
    }

    /**
     * @dev Updates mint state after successful mint
     */
    function _updateMintState(
        address minter,
        uint256 quantity,
        bool isAllowlistMint
    ) internal {
        mintedPerWallet[minter] += quantity;
        if (isAllowlistMint) {
            isAllowlisted[minter] = true;
        }
    }

    // ============ Reveal ============

    /**
     * @notice Reveal the collection by setting the base URI
     * @dev This is irreversible — once revealed, cannot be undone
     * @param baseUri_ Base URI for revealed metadata (e.g. ipfs://Qm.../)
     */
    function reveal(string calldata baseUri_) external onlyOwner {
        if (isRevealed) revert AlreadyRevealed();
        isRevealed = true;
        baseUri = baseUri_;
        emit Revealed(baseUri_);
    }

    /**
     * @notice Returns the token URI for a given token ID
     * @param tokenId Token ID
     * @return Token URI string
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A, IERC721A) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        if (!isRevealed) {
            return notRevealedUri;
        }

        return
            string(
                abi.encodePacked(baseUri, _toString(tokenId), baseExtension)
            );
    }

    // ============ Admin Functions ============

    /**
     * @notice Update public mint price
     * @param newPrice New price in wei
     */
    function setPublicPrice(uint256 newPrice) external onlyOwner {
        publicPrice = newPrice;
        emit PriceUpdated(newPrice, false);
    }

    /**
     * @notice Update allowlist mint price
     * @param newPrice New price in wei
     */
    function setAllowlistPrice(uint256 newPrice) external onlyOwner {
        allowlistPrice = newPrice;
        emit PriceUpdated(newPrice, true);
    }

    /**
     * @notice Update sale start times
     * @param newAllowlistStart New allowlist start timestamp
     * @param newPublicStart New public start timestamp
     */
    function setSaleTimes(
        uint256 newAllowlistStart,
        uint256 newPublicStart
    ) external onlyOwner {
        allowlistStartTime = newAllowlistStart;
        publicStartTime = newPublicStart;
        emit SaleTimesUpdated(newAllowlistStart, newPublicStart);
    }

    /**
     * @notice Update the allowlist Merkle root
     * @param newMerkleRoot New Merkle root
     */
    function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        allowlistMerkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }

    /**
     * @notice Update the unrevealed metadata URI
     * @param newUri New unrevealed URI
     */
    function setNotRevealedUri(string calldata newUri) external onlyOwner {
        notRevealedUri = newUri;
    }

    /**
     * @notice Update the base file extension for metadata
     * @param newExtension New extension (e.g. ".json")
     */
    function setBaseExtension(string calldata newExtension) external onlyOwner {
        baseExtension = newExtension;
    }

    /**
     * @notice Pause or unpause minting
     * @param paused_ True to pause, false to unpause
     */
    function setPaused(bool paused_) external onlyOwner {
        if (paused_) {
            _pause();
        } else {
            _unpause();
        }
    }

    /**
     * @notice Withdraw all ETH from the contract to the owner
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) return;

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH transfer failed");
        emit Withdrawal(owner(), balance);
    }

    /**
     * @notice Emergency withdraw of ERC-20 tokens accidentally sent to contract
     * @param token ERC-20 token address
     */
    function emergencyERC20Withdraw(IERC20 token) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        if (balance == 0) return;
        token.safeTransfer(owner(), balance);
    }

    // ============ Royalty Management ============

    /**
     * @notice Set a token-specific royalty override
     * @param tokenId Token ID
     * @param receiver Royalty receiver
     * @param royaltyBps Royalty in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint256 royaltyBps
    ) external onlyOwner {
        if (!_exists(tokenId)) revert MaxSupplyExceeded();
        if (receiver == address(0)) revert InvalidRoyaltyReceiver();
        _setTokenRoyalty(tokenId, receiver, royaltyBps);
    }

    /**
     * @notice Reset token-specific royalty to default
     * @param tokenId Token ID
     */
    function resetTokenRoyalty(uint256 tokenId) external onlyOwner {
        if (!_exists(tokenId)) revert MaxSupplyExceeded();
        _resetTokenRoyalty(tokenId);
    }

    // ============ View Functions ============

    /**
     * @notice Total tokens minted so far
     */
    function getTotalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    /**
     * @notice Remaining supply available to mint
     */
    function getRemainingSupply() external view returns (uint256) {
        return maxSupply - _totalMinted();
    }

    /**
     * @notice Get current sale phase
     * @return 0 = not started, 1 = allowlist, 2 = public, 3 = ended
     */
    function getSalePhase() external view returns (uint8) {
        if (isRevealed) return 3;
        if (block.timestamp >= publicStartTime) return 2;
        if (block.timestamp >= allowlistStartTime) return 1;
        return 0;
    }

    /**
     * @notice Contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Required Overrides ============

    /**
     * @dev Start token IDs at 1 instead of 0
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /**
     * @dev Required override for ERC-165 / ERC-2981 support
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721A, IERC721A, ERC2981) returns (bool) {
        return
            ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }

    // ============ Receive ============

    receive() external payable {}
}