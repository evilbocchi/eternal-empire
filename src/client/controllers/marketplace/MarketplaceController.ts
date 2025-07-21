//!native
//!optimize 2

/**
 * @fileoverview Client-side marketplace controller for UI management.
 * 
 * This controller handles:
 * - Marketplace UI display and interaction
 * - Listing creation and management interface
 * - Search and filtering functionality
 * - Real-time updates from server
 * - Marketplace notifications and feedback
 * 
 * @since 1.0.0
 */

import { Controller, OnInit, OnStart } from "@flamework/core";
import { Players, UserInputService } from "@rbxts/services";
import { MARKETPLACE_CONFIG } from "shared/marketplace/MarketplaceListing";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Packets from "shared/Packets";

/**
 * Client-side marketplace controller.
 */
@Controller()
export default class MarketplaceController implements OnInit, OnStart {
    
    private marketplaceGui?: ScreenGui;
    private currentListings = new Map<string, MarketplaceListing>();
    private myListings = new Map<string, MarketplaceListing>();
    private currentFilters: MarketplaceFilters = {};
    
    onInit() {
        // Set up packet listeners
        Packets.marketplaceListings.connect((listings) => {
            this.updateListings(listings);
        });

        Packets.listingUpdated.connect((listing) => {
            this.updateListing(listing);
        });

        Packets.listingRemoved.connect((uuid) => {
            this.removeListing(uuid);
        });

        Packets.myActiveListings.connect((listings) => {
            this.updateMyListings(listings);
        });

        Packets.marketplaceEnabled.connect((enabled) => {
            this.setMarketplaceEnabled(enabled);
        });

        Packets.marketplaceTransaction.connect((transaction) => {
            this.onTransactionCompleted(transaction);
        });
    }

    onStart() {
        this.createMarketplaceUI();
        this.setupHotkeys();
    }

    /**
     * Creates the marketplace UI interface.
     */
    private createMarketplaceUI(): void {
        const player = Players.LocalPlayer;
        const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
        
        // Create main marketplace GUI
        this.marketplaceGui = new Instance("ScreenGui");
        this.marketplaceGui.Name = "MarketplaceGui";
        this.marketplaceGui.Enabled = false;
        this.marketplaceGui.Parent = playerGui;

        // Main frame
        const mainFrame = new Instance("Frame");
        mainFrame.Name = "MainFrame";
        mainFrame.Size = UDim2.fromScale(0.8, 0.8);
        mainFrame.Position = UDim2.fromScale(0.1, 0.1);
        mainFrame.BackgroundColor3 = Color3.fromRGB(40, 40, 40);
        mainFrame.BorderSizePixel = 0;
        mainFrame.Parent = this.marketplaceGui;

        // Add UI corner
        const corner = new Instance("UICorner");
        corner.CornerRadius = new UDim(0, 12);
        corner.Parent = mainFrame;

        // Title bar
        const titleBar = new Instance("Frame");
        titleBar.Name = "TitleBar";
        titleBar.Size = UDim2.fromScale(1, 0.08);
        titleBar.Position = UDim2.fromScale(0, 0);
        titleBar.BackgroundColor3 = Color3.fromRGB(30, 30, 30);
        titleBar.BorderSizePixel = 0;
        titleBar.Parent = mainFrame;

        const titleCorner = new Instance("UICorner");
        titleCorner.CornerRadius = new UDim(0, 12);
        titleCorner.Parent = titleBar;

        const titleLabel = new Instance("TextLabel");
        titleLabel.Name = "TitleLabel";
        titleLabel.Size = UDim2.fromScale(0.7, 1);
        titleLabel.Position = UDim2.fromScale(0.02, 0);
        titleLabel.BackgroundTransparency = 1;
        titleLabel.Text = "Marketplace";
        titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
        titleLabel.TextScaled = true;
        titleLabel.TextXAlignment = Enum.TextXAlignment.Left;
        titleLabel.FontFace = Font.fromEnum(Enum.Font.SourceSansBold);
        titleLabel.Parent = titleBar;

        // Close button
        const closeButton = new Instance("TextButton");
        closeButton.Name = "CloseButton";
        closeButton.Size = UDim2.fromScale(0.06, 0.8);
        closeButton.Position = UDim2.fromScale(0.92, 0.1);
        closeButton.BackgroundColor3 = Color3.fromRGB(200, 50, 50);
        closeButton.Text = "✕";
        closeButton.TextColor3 = Color3.fromRGB(255, 255, 255);
        closeButton.TextScaled = true;
        closeButton.FontFace = Font.fromEnum(Enum.Font.SourceSansBold);
        closeButton.Parent = titleBar;

        const closeCorner = new Instance("UICorner");
        closeCorner.CornerRadius = new UDim(0, 6);
        closeCorner.Parent = closeButton;

        closeButton.Activated.Connect(() => {
            this.toggleMarketplace(false);
        });

        // Content area
        const contentFrame = new Instance("Frame");
        contentFrame.Name = "ContentFrame";
        contentFrame.Size = UDim2.fromScale(1, 0.92);
        contentFrame.Position = UDim2.fromScale(0, 0.08);
        contentFrame.BackgroundTransparency = 1;
        contentFrame.Parent = mainFrame;

        // Tab system
        this.createTabSystem(contentFrame);
    }

    /**
     * Creates the tab system for different marketplace views.
     */
    private createTabSystem(parent: Frame): void {
        // Tab bar
        const tabBar = new Instance("Frame");
        tabBar.Name = "TabBar";
        tabBar.Size = UDim2.fromScale(1, 0.08);
        tabBar.Position = UDim2.fromScale(0, 0);
        tabBar.BackgroundColor3 = Color3.fromRGB(50, 50, 50);
        tabBar.BorderSizePixel = 0;
        tabBar.Parent = parent;

        const tabLayout = new Instance("UIListLayout");
        tabLayout.FillDirection = Enum.FillDirection.Horizontal;
        tabLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left;
        tabLayout.SortOrder = Enum.SortOrder.LayoutOrder;
        tabLayout.Parent = tabBar;

        // Create tabs
        const tabs = ["Browse", "My Listings", "Create Listing"];
        const tabButtons: TextButton[] = [];

        for (let i = 0; i < tabs.size(); i++) {
            const tabName = tabs[i];
            const tabButton = new Instance("TextButton");
            tabButton.Name = tabName + "Tab";
            tabButton.Size = UDim2.fromScale(0.2, 1);
            tabButton.BackgroundColor3 = Color3.fromRGB(60, 60, 60);
            tabButton.Text = tabName;
            tabButton.TextColor3 = Color3.fromRGB(200, 200, 200);
            tabButton.TextScaled = true;
            tabButton.FontFace = Font.fromEnum(Enum.Font.SourceSans);
            tabButton.BorderSizePixel = 0;
            tabButton.LayoutOrder = i;
            tabButton.Parent = tabBar;

            tabButtons.push(tabButton);

            tabButton.Activated.Connect(() => {
                this.switchTab(tabName, tabButtons);
            });
        }

        // Content area for tabs
        const tabContent = new Instance("Frame");
        tabContent.Name = "TabContent";
        tabContent.Size = UDim2.fromScale(1, 0.92);
        tabContent.Position = UDim2.fromScale(0, 0.08);
        tabContent.BackgroundTransparency = 1;
        tabContent.Parent = parent;

        // Create tab content frames
        this.createBrowseTab(tabContent);
        this.createMyListingsTab(tabContent);
        this.createCreateListingTab(tabContent);

        // Set default tab
        this.switchTab("Browse", tabButtons);
    }

    /**
     * Creates the browse marketplace tab.
     */
    private createBrowseTab(parent: Frame): void {
        const browseFrame = new Instance("Frame");
        browseFrame.Name = "BrowseFrame";
        browseFrame.Size = UDim2.fromScale(1, 1);
        browseFrame.BackgroundTransparency = 1;
        browseFrame.Visible = false;
        browseFrame.Parent = parent;

        // Search and filter area
        const filterFrame = new Instance("Frame");
        filterFrame.Name = "FilterFrame";
        filterFrame.Size = UDim2.fromScale(1, 0.12);
        filterFrame.Position = UDim2.fromScale(0, 0);
        filterFrame.BackgroundColor3 = Color3.fromRGB(45, 45, 45);
        filterFrame.BorderSizePixel = 0;
        filterFrame.Parent = browseFrame;

        // Search box
        const searchBox = new Instance("TextBox");
        searchBox.Name = "SearchBox";
        searchBox.Size = UDim2.fromScale(0.3, 0.6);
        searchBox.Position = UDim2.fromScale(0.02, 0.2);
        searchBox.BackgroundColor3 = Color3.fromRGB(60, 60, 60);
        searchBox.Text = "Search items...";
        searchBox.TextColor3 = Color3.fromRGB(200, 200, 200);
        searchBox.TextScaled = true;
        searchBox.ClearTextOnFocus = true;
        searchBox.Parent = filterFrame;

        searchBox.FocusLost.Connect(() => {
            this.updateSearch(searchBox.Text);
        });

        // Listings scroll frame
        const listingsScroll = new Instance("ScrollingFrame");
        listingsScroll.Name = "ListingsScroll";
        listingsScroll.Size = UDim2.fromScale(1, 0.88);
        listingsScroll.Position = UDim2.fromScale(0, 0.12);
        listingsScroll.BackgroundTransparency = 1;
        listingsScroll.ScrollBarThickness = 8;
        listingsScroll.ScrollBarImageColor3 = Color3.fromRGB(100, 100, 100);
        listingsScroll.Parent = browseFrame;

        const listingsLayout = new Instance("UIListLayout");
        listingsLayout.SortOrder = Enum.SortOrder.LayoutOrder;
        listingsLayout.Padding = new UDim(0, 4);
        listingsLayout.Parent = listingsScroll;
    }

    /**
     * Creates the my listings tab.
     */
    private createMyListingsTab(parent: Frame): void {
        const myListingsFrame = new Instance("Frame");
        myListingsFrame.Name = "MyListingsFrame";
        myListingsFrame.Size = UDim2.fromScale(1, 1);
        myListingsFrame.BackgroundTransparency = 1;
        myListingsFrame.Visible = false;
        myListingsFrame.Parent = parent;

        // Add content for my listings...
    }

    /**
     * Creates the create listing tab.
     */
    private createCreateListingTab(parent: Frame): void {
        const createFrame = new Instance("Frame");
        createFrame.Name = "CreateListingFrame";
        createFrame.Size = UDim2.fromScale(1, 1);
        createFrame.BackgroundTransparency = 1;
        createFrame.Visible = false;
        createFrame.Parent = parent;

        // Add content for creating listings...
    }

    /**
     * Switches between marketplace tabs.
     */
    private switchTab(tabName: string, tabButtons: TextButton[]): void {
        if (this.marketplaceGui === undefined) return;

        const tabContent = this.marketplaceGui.FindFirstChild("MainFrame")?.FindFirstChild("ContentFrame")?.FindFirstChild("TabContent") as Frame;
        if (tabContent === undefined) return;

        // Hide all tabs
        for (const child of tabContent.GetChildren()) {
            if (child.IsA("Frame")) {
                child.Visible = false;
            }
        }

        // Show selected tab
        const targetFrame = tabContent.FindFirstChild(tabName + "Frame") as Frame;
        if (targetFrame !== undefined) {
            targetFrame.Visible = true;
        }

        // Update tab button appearances
        for (const button of tabButtons) {
            if (button.Text === tabName) {
                button.BackgroundColor3 = Color3.fromRGB(80, 80, 80);
                button.TextColor3 = Color3.fromRGB(255, 255, 255);
            } else {
                button.BackgroundColor3 = Color3.fromRGB(60, 60, 60);
                button.TextColor3 = Color3.fromRGB(200, 200, 200);
            }
        }
    }

    /**
     * Sets up keyboard hotkeys for marketplace.
     */
    private setupHotkeys(): void {
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            if (input.KeyCode === Enum.KeyCode.M) {
                this.toggleMarketplace();
            }
        });
    }

    /**
     * Toggles marketplace UI visibility.
     */
    private toggleMarketplace(visible?: boolean): void {
        if (this.marketplaceGui === undefined) return;

        if (visible !== undefined) {
            this.marketplaceGui.Enabled = visible;
        } else {
            this.marketplaceGui.Enabled = !this.marketplaceGui.Enabled;
        }

        if (this.marketplaceGui.Enabled) {
            // Request fresh marketplace data
            Packets.getMarketplaceListings.fire();
        }
    }

    /**
     * Updates the marketplace listings display.
     */
    private updateListings(listings: Map<string, MarketplaceListing>): void {
        this.currentListings = listings;
        this.refreshListingsDisplay();
    }

    /**
     * Updates a single listing.
     */
    private updateListing(listing: MarketplaceListing): void {
        this.currentListings.set(listing.uuid, listing);
        this.refreshListingsDisplay();
    }

    /**
     * Removes a listing from display.
     */
    private removeListing(uuid: string): void {
        this.currentListings.delete(uuid);
        this.refreshListingsDisplay();
    }

    /**
     * Updates my listings display.
     */
    private updateMyListings(listings: Map<string, MarketplaceListing>): void {
        this.myListings = listings;
        // Update my listings UI...
    }

    /**
     * Sets marketplace enabled state.
     */
    private setMarketplaceEnabled(enabled: boolean): void {
        if (this.marketplaceGui !== undefined && !enabled) {
            this.marketplaceGui.Enabled = false;
        }
    }

    /**
     * Handles completed transactions.
     */
    private onTransactionCompleted(transaction: MarketplaceTransaction): void {
        // Show transaction notification
        // Play success sound
        // Update UI if needed
    }

    /**
     * Updates search filters.
     */
    private updateSearch(searchText: string): void {
        this.currentFilters.search = searchText === "Search items..." ? undefined : searchText;
        // Request updated listings (simplified for now)
        Packets.getMarketplaceListings.fire();
    }

    /**
     * Refreshes the listings display.
     */
    private refreshListingsDisplay(): void {
        if (this.marketplaceGui === undefined) return;

        const listingsScroll = this.marketplaceGui.FindFirstChild("MainFrame")?.FindFirstChild("ContentFrame")?.FindFirstChild("TabContent")?.FindFirstChild("BrowseFrame")?.FindFirstChild("ListingsScroll") as ScrollingFrame;
        if (listingsScroll === undefined) return;

        // Clear existing listings
        for (const child of listingsScroll.GetChildren()) {
            if (child.IsA("Frame") && child.Name !== "UIListLayout") {
                child.Destroy();
            }
        }

        // Add current listings
        let layoutOrder = 0;
        for (const [uuid, listing] of this.currentListings) {
            this.createListingFrame(listingsScroll, listing, layoutOrder++);
        }

        // Update scroll frame size
        const layout = listingsScroll.FindFirstChildOfClass("UIListLayout");
        if (layout !== undefined) {
            listingsScroll.CanvasSize = UDim2.fromOffset(0, layout.AbsoluteContentSize.Y);
        }
    }

    /**
     * Creates a single listing frame.
     */
    private createListingFrame(parent: ScrollingFrame, listing: MarketplaceListing, layoutOrder: number): void {
        const listingFrame = new Instance("Frame");
        listingFrame.Name = "Listing_" + listing.uuid;
        listingFrame.Size = UDim2.fromScale(1, 0);
        listingFrame.AutomaticSize = Enum.AutomaticSize.Y;
        listingFrame.BackgroundColor3 = Color3.fromRGB(50, 50, 50);
        listingFrame.BorderSizePixel = 0;
        listingFrame.LayoutOrder = layoutOrder;
        listingFrame.Parent = parent;

        const corner = new Instance("UICorner");
        corner.CornerRadius = new UDim(0, 6);
        corner.Parent = listingFrame;

        // Add listing content (item name, price, buy button, etc.)
        // This would be expanded with proper item display logic
    }

    /**
     * Creates a new listing.
     */
    createListing(uuid: string, price: CurrencyBundle, listingType: "buyout" | "auction", duration: number): void {
        Packets.createListing.fire(uuid, price, listingType, duration);
    }

    /**
     * Cancels a listing.
     */
    cancelListing(uuid: string): void {
        Packets.cancelListing.fire(uuid);
    }

    /**
     * Buys an item.
     */
    buyItem(uuid: string): void {
        Packets.buyItem.fire(uuid);
    }

    /**
     * Places a bid on an auction.
     */
    placeBid(uuid: string, bidAmount: CurrencyBundle): void {
        Packets.placeBid.fire(uuid, bidAmount);
    }
}