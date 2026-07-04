# Smart Contract Documentation

## Overview

NexusNFT is an ERC-721A compliant NFT collection with gas-optimized minting, reveal mechanism, royalty support, and allowlist functionality.

## Contract Architecture

### `NexusNFT.sol`

**Core Implementation**: `contracts/NexusNFT.sol`

The contract inherits from:
- `ERC721A` — Gas-efficient batch minting
- `Ownable` — Access control for admin functions
- `ReentrancyGuard` — Protection against reentrancy attacks
- `Pausable` — Emergency pause functionality
- `ERC2981` — Royalty standard support

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_SUPPLY` | 10,000 | Hard cap on total supply |
| `MAX_MINT_PER_WALLET` | 20 | Max public mints per wallet |
| `DEFAULT_ROYALTY_BPS` | 750 (7.5%) | Default royalty fee |
| `ALLOWLIST_MINT_LIMIT` | 5 | Max allowlist mints per wallet |

### State Variables

- `maxSupply` — Immutable maximum supply
- `maxMintPerWallet` — Immutable public mint limit
- `allowlistMintLimit` — Immutable allowlist mint limit
- `publicPrice` — Public mint price (wei)
- `allowlistPrice` — Allowlist mint price (wei)
- `allowlistStartTime` — Allowlist sale start timestamp
- `publicStartTime` — Public sale start timestamp
- `allowlistMerkleRoot` — Merkle root for allowlist verification
- `isRevealed` — Whether metadata has been revealed
- `notRevealedUri` — URI for unrevealed tokens
- `baseUri` — Base URI for revealed tokens
- `baseExtension` — File extension (default: `.json`)
- `mintedPerWallet` — Mapping of address → mint count
- `isAllowlisted` — Mapping of address → allowlist status

## Functions

### Minting

#### `mintAllowlist(uint256 quantity, bytes32[] calldata merkleProof)`
- **Access**: Allowed when allowlist sale is active
- **Payment**: `allowlistPrice * quantity`
- **Validation**: Merkle proof, wallet limit, supply, paused state
- **Security**: `nonReentrant`, `whenNotPaused`

#### `mintPublic(uint256 quantity)`
- **Access**: Allowed when public sale is active
- **Payment**: `publicPrice * quantity`
- **Validation**: Wallet limit, supply, paused state
- **Security**: `nonReentrant`, `whenNotPaused`

### Reveal

#### `reveal(string calldata baseUri_)`
- **Access**: `onlyOwner`
- **Effect**: Sets `isRevealed = true` and updates `baseUri`
- **Irreversible**: Once revealed, cannot be undone

### Admin

| Function | Description | Access |
|----------|-------------|--------|
| `setPublicPrice(uint256)` | Update public mint price | Owner |
| `setAllowlistPrice(uint256)` | Update allowlist price | Owner |
| `setSaleTimes(uint256, uint256)` | Update sale start times | Owner |
| `setMerkleRoot(bytes32)` | Update allowlist Merkle root | Owner |
| `setNotRevealedUri(string)` | Update unrevealed URI | Owner |
| `setBaseExtension(string)` | Update base file extension | Owner |
| `setPaused(bool)` | Toggle pause state | Owner |
| `withdraw()` | Withdraw contract ETH | Owner |
| `emergencyERC20Withdraw(address)` | Withdraw ERC20 tokens | Owner |

### Views

| Function | Returns | Description |
|----------|---------|-------------|
| `getTotalMinted()` | `uint256` | Total supply minted |
| `getRemainingSupply()` | `uint256` | Remaining supply |
| `getMintedPerWallet(address)` | `uint256` | Wallet's mint count |
| `getSalePhase()` | `uint8` | 0=Not Started, 1=Allowlist, 2=Public, 3=Ended |
| `getContractBalance()` | `uint256` | Contract ETH balance |
| `supportsInterface(bytes4)` | `bool` | ERC-165 support |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `NFTMinted` | minter, quantity, isAllowlist | Emitted on mint |
| `PriceUpdated` | price, isAllowlist | Price change |
| `SaleTimesUpdated` | allowlistStart, publicStart | Sale time change |
| `MerkleRootUpdated` | merkleRoot | Merkle root update |
| `Revealed` | baseUri | Collection revealed |
| `Withdrawal` | recipient, amount | ETH withdrawn |

## Security

### Access Control
- Admin functions guarded by `onlyOwner` modifier
- Mint functions protected by `nonReentrant`
- Emergency pause via `Pausable`

### Reentrancy Protection
- All mint functions use `ReentrancyGuard`
- Withdraw function is `nonReentrant`

### Merkle Proof Validation
- Allowlist uses Merkle trees for gas-efficient proof verification
- Prevents Sybil attacks on allowlist

### Supply Caps
- `MAX_SUPPLY` enforces hard cap (10,000)
- Per-wallet limits prevent hoarding

## Gas Optimizations

1. **ERC-721A**: Batch minting costs are amortized across multiple tokens
2. **Immutable variables**: Gas savings over storage variables
3. **Merkle proofs**: O(log n) verification instead of O(n) storage
4. **Custom errors**: Cheaper than string revert messages
5. **Packed storage**: Efficient state variable layout

## Deployment

### Requirements
- Solidity `^0.8.24`
- OpenZeppelin `^5.1.0`
- ERC721A `^4.2.3`

### Constructor Parameters
```solidity
constructor(
    string memory name_,          // Token name
    string memory symbol_,        // Token symbol
    uint256 maxSupply_,           // Max supply (≤ 10,000)
    uint256 maxMintPerWallet_,    // Max per wallet (≤ 20)
    uint256 allowlistMintLimit_,  // Allowlist limit (≤ 5)
    uint256 publicPrice_,         // Public price in wei
    uint256 allowlistPrice_,      // Allowlist price in wei
    uint256 allowlistStartTime_,  // Allowlist start timestamp
    uint256 publicStartTime_,     // Public start timestamp
    string memory notRevealedUri_,// Unrevealed metadata URI
    address royaltyReceiver_,     // Royalty recipient
    uint256 royaltyBps_           // Royalty basis points
)
```

## Testing

Run the test suite:
```bash
npx hardhat test
npx hardhat test --network localhost
npx hardhat coverage
REPORT_GAS=true npx hardhat test
```

See `test/NexusNFT.test.js` for comprehensive test coverage including:
- Deployment configuration
- Allowlist minting with Merkle proofs
- Public minting with price validation
- Reveal mechanism
- Admin functions
- Pause/unpause
- Withdrawal
- Royalty management
- Edge cases and error conditions
