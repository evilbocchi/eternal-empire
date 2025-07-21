# JME Marketplace Implementation

This document outlines the marketplace feature implementation for JME, providing a full-featured auction-style marketplace for unique items.

## Overview

The marketplace system allows players to list, buy, and sell unique items with UUIDs using both instant buyout and auction mechanics. The implementation focuses on data integrity, anti-dupe protection, and crash recovery.

## Architecture

### Core Components

1. **MarketplaceService** (`src/server/services/marketplace/MarketplaceService.ts`)
   - Core marketplace logic with full auction support
   - UpdateAsync operations for anti-dupe protection
   - External trade token system for crash recovery
   - Webhook logging for moderation

2. **SimpleMarketplaceService** (`src/server/services/marketplace/SimpleMarketplaceService.ts`)
   - Simplified proof-of-concept implementation
   - Basic listing, buying, and cancellation
   - Demonstrates core DataStore patterns

3. **MarketplaceListing** (`src/shared/marketplace/MarketplaceListing.ts`)
   - Data structures for listings, auctions, and trade tokens
   - Configuration constants and type definitions

4. **MarketplaceController** (`src/client/controllers/marketplace/MarketplaceController.ts`)
   - Client-side UI management
   - Tab-based interface for browsing, managing listings, and creating new listings
   - Real-time updates and notifications

### Key Features Implemented

#### ✅ Core Requirements
- [x] UUID-based unique item listings
- [x] DataStore storage per-UUID for atomicity
- [x] UpdateAsync for anti-dupe protection
- [x] External trade token system for crash recovery
- [x] Basic marketplace UI framework
- [x] Admin commands for marketplace management

#### ✅ Anti-Dupe Protection
- One DataStore key per auction minimizes dupe risk
- UpdateAsync used for all critical modifications
- No GetAsync/SetAsync combinations that could cause race conditions

#### ✅ Anti-Loss/Crash Logic
- Processing tokens uploaded to external webhook before transactions
- Trade recovery system checks for interrupted transactions on startup
- Rollback capability for failed or interrupted trades

#### ✅ Marketplace UI
- Tab-based interface (Browse, My Listings, Create Listing)
- Search and filtering capabilities
- Real-time listing updates
- Hotkey support (Press 'M' to open)

#### ✅ Admin Features
- Enable/disable marketplace functionality
- Marketplace statistics and monitoring
- Trade webhook configuration
- Test commands for validation

## Usage

### Admin Commands

- `/marketplacehelp` - Display all marketplace commands
- `/marketplacetoggle` - Enable/disable the marketplace
- `/marketplacestats` - View marketplace statistics
- `/testmarketplace` - Test marketplace functionality
- `/settradewebhook <url>` - Set trade recovery webhook URL

### Player Usage

#### Regular Interface
- Press 'M' to open the marketplace interface
- Browse existing listings in the "Browse" tab
- View your active listings in "My Listings" tab
- Create new listings in "Create Listing" tab

#### Marketplace Terminal (Intermittent Isles)
- **Marketplace Terminal** - A placeable item that provides automatic marketplace access
- Purchase and place the terminal in Intermittent Isles (costs 1,000 Funds)
- **Automatic Detection** - Standing within 15 studs (7.5 stud radius) automatically opens the marketplace
- **Movement Restriction** - Player movement is disabled while the marketplace UI is open from a terminal
- **Auto-Close** - The marketplace automatically closes when the player moves outside the detection range
- **Cooldown System** - After leaving the area, there's a 2-second cooldown before the UI can reopen
- **Visual Effects** - The terminal has a blue glow and particle effects to indicate it's active

## Data Structures

### MarketplaceListing
```typescript
interface MarketplaceListing {
    uuid: string;                    // Unique item UUID
    sellerId: number;               // Seller user ID
    sellerEmpireId: string;         // Seller empire ID
    price: CurrencyBundle;          // Asking price
    listingType: "buyout" | "auction";
    created: number;                // Unix timestamp
    expires?: number;               // Auto-expiry timestamp
    currentBid?: CurrencyBundle;    // Current highest bid
    currentBidderId?: number;       // Current bidder
    listingFee?: CurrencyBundle;    // Fee paid for listing
    active: boolean;                // Listing status
}
```

### TradeToken
```typescript
interface TradeToken {
    uuid: string;                   // Item being traded
    empireKey: string;              // Empire identifier
    buyerId: number;                // Buyer user ID
    sellerId: number;               // Seller user ID
    price: CurrencyBundle;          // Transaction price
    timestamp: number;              // Transaction time
    status: "processing" | "completed" | "failed" | "rolled_back";
}
```

## Configuration

### Marketplace Settings
- `MAX_LISTINGS_PER_PLAYER`: 10 listings maximum per player
- `DEFAULT_LISTING_DURATION`: 7 days (604,800 seconds)
- `LISTING_FEE_PERCENTAGE`: 1% listing fee
- `TRANSACTION_TAX_PERCENTAGE`: 2% transaction tax
- `PROCESSING_TOKEN_TIMEOUT`: 1 hour for token expiry

### DataStore Names
- `MarketplaceListings`: Active marketplace listings
- `TradeTokens`: Trade recovery tokens
- `MarketplaceHistory`: Transaction history

## Technical Implementation

### Anti-Dupe Strategy
1. **One key per auction**: Each unique item gets its own DataStore key
2. **UpdateAsync only**: All critical operations use UpdateAsync to prevent race conditions
3. **Atomic operations**: Listing creation, buying, and cancellation are atomic
4. **External verification**: Trade tokens provide external audit trail

### Crash Recovery Process
1. Before finalizing any trade, upload processing token to external webhook
2. Token contains all transaction details and status
3. On server startup or player rejoin, check for unresolved tokens
4. Complete successful transactions or rollback failed ones
5. Update token status to prevent duplicate processing

### Error Handling
- Graceful degradation when DataStore is unavailable
- Marketplace can be disabled by administrators
- Comprehensive logging for debugging and support
- Automatic rollback of failed transactions

## Testing

Use the `/testmarketplace` command to verify basic functionality:

```
=== MARKETPLACE TEST ===
Create listing: true
Get listing: {uuid: "test-item-12345", price: 1000, created: 1234567890, active: true}
Cancel listing: true
=== TEST COMPLETE ===
```

## Future Enhancements

### Planned Features
- [ ] Timed auctions with bidding periods
- [ ] Auto-expiry for stale listings
- [ ] Advanced search and filtering
- [ ] Listing categories and item types
- [ ] Price history and market analytics
- [ ] Bulk operations for multiple items

### Integration Opportunities
- [ ] Discord webhook notifications for trades
- [ ] External API for marketplace data
- [ ] Mobile app integration
- [ ] Cross-server marketplace (if applicable)

## Notes

- The marketplace is disabled by default and must be enabled by an administrator
- External webhook URL must be configured for full trade recovery functionality
- The system is designed to fail safely - if in doubt, it will cancel transactions
- All marketplace operations are logged for audit and debugging purposes

## Marketplace Terminal Implementation

### Technical Details

The Marketplace Terminal (`src/shared/items/tools/MarketplaceTerminal.ts`) provides a region-based marketplace interface:

#### Key Features
- **Region Detection**: Uses a 15x15 stud invisible detection zone around the terminal
- **Automatic UI Management**: Opens marketplace UI when players enter, closes when they leave
- **Movement Control**: Disables player movement (`PlatformStand = true`, `Sit = true`) while UI is active
- **State Tracking**: Manages multiple concurrent players with individual state tracking
- **Cooldown System**: Prevents immediate UI reopening after leaving the area

#### Implementation Pattern
```typescript
// Server-side detection and control
detectionRegion.Touched.Connect((hit) => {
    // Detect player entry and open UI
    Packets.openMarketplaceTerminal.fire(player);
    // Disable movement
    humanoid.PlatformStand = true;
    humanoid.Sit = true;
});

// Continuous monitoring for exit detection
RunService.Heartbeat.Connect(() => {
    // Check distance and handle exits
    if (distance > DETECTION_RANGE) {
        Packets.closeMarketplaceTerminal.fire(player);
        // Restore movement
        humanoid.PlatformStand = false;
        humanoid.Sit = false;
    }
});
```

#### Client-side Integration
- Integrates with existing `MarketplaceController`
- Hides close button when opened from terminal
- Restores normal functionality when opened via hotkey
- Visual effects include glowing and particle systems

#### Files Added
- `src/shared/items/tools/MarketplaceTerminal.ts` - Terminal item implementation
- `src/shared/Packets.ts` - Added `openMarketplaceTerminal` and `closeMarketplaceTerminal` signals
- `src/client/controllers/marketplace/MarketplaceController.ts` - Added terminal-specific UI handling

This implementation provides a solid foundation for a secure, reliable marketplace system that can be expanded with additional features as needed.