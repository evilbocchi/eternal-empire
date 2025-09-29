import Signal from "@antivivi/lemon-signal";
import { getInstanceInfo } from "@antivivi/vrldk";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { CollectionService, Debris, TweenService } from "@rbxts/services";
import useHotkeyWithTooltip from "client/components/hotkeys/useHotkeyWithTooltip";
import InventoryFilter, {
    filterItems,
    useBasicInventoryFilter,
} from "client/components/item/inventory/InventoryFilter";
import { PurchaseManager } from "client/components/item/shop/PurchaseWindow";
import { createShopSlot, updateShopSlot, type ShopSlotHandle } from "client/components/item/shop/ShopSlot";
import { showErrorToast } from "client/components/toast/ToastService";
import useProperty from "client/hooks/useProperty";
import { getSound, playSound } from "shared/asset/GameAssets";
import { RobotoSlabHeavy } from "shared/asset/GameFonts";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

type ShopCandidate = { guiPart: Part; shop: Shop };

export namespace ShopManager {
    /** The current shop GUI part being displayed. */
    let shopGuiPart: Part | undefined;

    export const opened = new Signal<(shop?: Shop, adornee?: Part) => void>();

    /**
     * Animates and hides the shop GUI part.
     * @param shopGuiPart The shop GUI part to hide.
     */
    export function hideShopGuiPart(shopGuiPart: Part) {
        TweenService.Create(shopGuiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 1 }).Play();

        const sound = getSound("ShopClose.mp3");
        sound.Play();
        sound.Parent = shopGuiPart;
        Debris.AddItem(sound, 5);
    }

    /**
     * Refreshes the shop interface and updates the displayed shop and items.
     * @param guiPart The shop GUI part to display.
     * @param shop The shop data to display.
     */
    export function refreshShop(guiPart?: Part, shop?: Shop) {
        if (shopGuiPart === guiPart) return;

        const previousShopGuiPart = shopGuiPart;
        shopGuiPart = guiPart;

        if (previousShopGuiPart !== undefined && previousShopGuiPart !== guiPart) {
            hideShopGuiPart(previousShopGuiPart);
        }

        if (guiPart === undefined || shop === undefined) {
            opened.fire();
            return;
        }

        const sound = getSound("ShopOpen.mp3");
        sound.Play();
        sound.Parent = guiPart;
        Debris.AddItem(sound, 5);

        TweenService.Create(guiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 0 }).Play();
        opened.fire(shop, guiPart);
    }

    export function checkForShop(candidates: Map<BasePart, ShopCandidate>) {
        const primaryPart = getPlayerCharacter()?.PrimaryPart;
        if (primaryPart === undefined) return;

        let shopFound = false;
        for (const [hitbox, { guiPart, shop }] of candidates) {
            const localPosition = hitbox.CFrame.PointToObjectSpace(primaryPart.Position);
            if (math.abs(localPosition.X) > hitbox.Size.X / 2 || math.abs(localPosition.Z) > hitbox.Size.Z / 2)
                continue;

            refreshShop(guiPart, shop);
            shopGuiPart = guiPart;
            shopFound = true;
            break;
        }

        if (shopFound === false) {
            refreshShop();
        }
    }
}

/**
 * Main shop window component with integrated filtering
 */
export default function ShopGui() {
    const [{ shop, adornee }, setShopInfo] = useState<{ shop?: Shop; adornee?: Part }>({});
    const { searchQuery, props: filterProps } = useBasicInventoryFilter();
    const [hideMaxedItems, setHideMaxedItems] = useState(Packets.settings.get().HideMaxedItems);
    const ownedPerItem = useProperty(Packets.bought) ?? new Map<string, number>();
    const shopItems = shop?.items ?? [];
    const shopItemIds = useMemo(() => new Set(shopItems.map((item) => item.id)), [shopItems]);
    const scrollingFrameRef = useRef<ScrollingFrame>();
    const itemSlotsRef = useRef(new Map<string, ShopSlotHandle>());
    const handleItemClick = useCallback((item: Item) => {
        playSound("MenuClick.mp3");
        PurchaseManager.select(item);
    }, []);

    useEffect(() => {
        const settingsConnection = Packets.settings.observe((settings) => {
            setHideMaxedItems(settings.HideMaxedItems);
        });
        const openedConnection = ShopManager.opened.connect((shop, adornee) => {
            setShopInfo((prev) => {
                if (shop === undefined) {
                    return { shop: prev.shop, adornee: undefined };
                }
                return { shop, adornee };
            });
        });

        const candidates = new Map<BasePart, ShopCandidate>();
        const addCandidate = (hitbox: BasePart) => {
            const model = hitbox.Parent;
            if (model === undefined) return;
            const itemId = getInstanceInfo(model, "ItemId");
            if (itemId === undefined) return;
            const item = Items.getItem(itemId);
            if (item === undefined) return;
            const shop = item.findTrait("Shop");
            if (shop === undefined) return;
            const shopGuiPart = model.FindFirstChild("ShopGuiPart") as Part;
            if (shopGuiPart === undefined) return;
            shopGuiPart.LocalTransparencyModifier = 1;
            candidates.set(hitbox, { guiPart: shopGuiPart, shop });
        };
        for (const hitbox of CollectionService.GetTagged("Shop")) {
            addCandidate(hitbox as BasePart);
        }
        CollectionService.GetInstanceAddedSignal("Shop").Connect((hitbox) => {
            addCandidate(hitbox as BasePart);
        });
        CollectionService.GetInstanceRemovedSignal("Shop").Connect((hitbox) => {
            candidates.delete(hitbox as BasePart);
        });

        let active = true;
        const loop = () => {
            if (active === false) return;
            ShopManager.checkForShop(candidates);
            task.delay(0.1, loop);
        };
        loop();
        return () => {
            active = false;
            settingsConnection.disconnect();
            openedConnection.disconnect();
        };
    }, []);

    useEffect(() => {
        return () => {
            const slots = itemSlotsRef.current;
            for (const [, slot] of slots) {
                slot.destroy();
            }
            slots.clear();
        };
    }, []);

    useEffect(() => {
        const frame = scrollingFrameRef.current;
        if (!frame) return;

        const slots = itemSlotsRef.current;
        for (const item of Items.sortedItems) {
            if (slots.has(item.id)) continue;

            const slot = createShopSlot(item, {
                parent: frame,
                layoutOrder: item.layoutOrder,
                visible: false,
                onActivated: handleItemClick,
            });
            slots.set(item.id, slot);
        }
    }, [handleItemClick]);

    const dataPerItem = useMemo(() => {
        return filterItems(shopItems, searchQuery, filterProps.traitFilters);
    }, [shopItems, searchQuery, filterProps.traitFilters]);

    useEffect(() => {
        const frame = scrollingFrameRef.current;
        if (!frame) return;

        const slots = itemSlotsRef.current;
        for (const item of Items.sortedItems) {
            const slot = slots.get(item.id);
            if (slot === undefined) continue;

            const slotData = dataPerItem.get(item.id);
            const layoutOrder = slotData?.layoutOrder ?? item.layoutOrder;
            const baseVisible = shopItemIds.has(item.id) && slotData?.visible === true;
            const ownedAmount = ownedPerItem.get(item.id) ?? 0;

            updateShopSlot(slot, {
                parent: frame,
                layoutOrder,
                baseVisible,
                hideMaxedItems,
                ownedAmount,
                onActivated: handleItemClick,
            });
        }
    }, [dataPerItem, shopItemIds, hideMaxedItems, ownedPerItem, handleItemClick]);

    const { events } = useHotkeyWithTooltip({
        action: () => {
            if (!shop) return false;
            if (Packets.buyAllItems.toServer(shop.items.map((item) => item.id))) {
                playSound("ItemPurchase.mp3");
            } else {
                playSound("Error.mp3");
                showErrorToast("Unable to purchase all items.");
            }
            return true;
        },
        label: "Purchase All",
    });

    return (
        <surfacegui
            key={"Shop"}
            Adornee={adornee}
            AlwaysOnTop={true}
            ClipsDescendants={true}
            Enabled={adornee !== undefined && shop !== undefined}
            Face={Enum.NormalId.Front}
            LightInfluence={0}
            PixelsPerStud={50}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            ResetOnSpawn={false}
        >
            {/* Main container */}
            <uipadding
                PaddingBottom={new UDim(0, 5)}
                PaddingLeft={new UDim(0, 5)}
                PaddingRight={new UDim(0, 5)}
                PaddingTop={new UDim(0, 5)}
            />
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Filter options */}
            <InventoryFilter color={shop?.item.difficulty.color} {...filterProps} />

            {/* Item list scrolling frame */}
            <scrollingframe
                ref={scrollingFrameRef}
                Active={true}
                AnchorPoint={new Vector2(0.5, 1)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                LayoutOrder={1}
                Position={new UDim2(0.5, 0, 1, 0)}
                ScrollBarThickness={6}
                Selectable={false}
                Size={new UDim2(1, -5, 0.9, 0)}
            >
                {/* Grid layout for items */}
                <uigridlayout
                    CellPadding={new UDim2(0, 12, 0, 12)}
                    CellSize={new UDim2(0.167, -12, 0, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                >
                    <uiaspectratioconstraint AspectRatio={0.8} AspectType={Enum.AspectType.ScaleWithParentSize} />
                </uigridlayout>

                {/* Padding */}
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />

                {/* Border stroke */}
                <uistroke Color={shop?.item.difficulty.color} Thickness={3} />

                {/* Buy All button */}
                <frame BackgroundTransparency={1} LayoutOrder={99999} Size={new UDim2(0, 100, 0, 100)}>
                    <textbutton
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundColor3={Color3.fromRGB(85, 85, 255)}
                        BorderColor3={Color3.fromRGB(27, 42, 53)}
                        LayoutOrder={9999}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Selectable={false}
                        Size={new UDim2(0.7, 0, 0.6, 0)}
                        Text=""
                        Event={{
                            ...events,
                        }}
                    >
                        {/* Button stroke */}
                        <uistroke
                            ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                            Color={Color3.fromRGB(54, 44, 194)}
                            Thickness={3}
                        >
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                        new ColorSequenceKeypoint(0.597, Color3.fromRGB(156, 156, 156)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                    ])
                                }
                                Rotation={60}
                            />
                        </uistroke>

                        {/* Button gradient */}
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                ])
                            }
                            Rotation={270}
                        />

                        {/* Button padding */}
                        <uipadding
                            PaddingBottom={new UDim(0, 5)}
                            PaddingLeft={new UDim(0, 5)}
                            PaddingRight={new UDim(0, 5)}
                            PaddingTop={new UDim(0, 5)}
                        />

                        {/* Button layout */}
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 5)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />

                        {/* Button text */}
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabHeavy}
                            LayoutOrder={-5}
                            Size={new UDim2(1, 0, 1, 0)}
                            Text="Buy All Items"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={30}
                            TextWrapped={true}
                        >
                            <uistroke Color={Color3.fromRGB(5, 16, 0)} Thickness={2} />
                        </textlabel>
                    </textbutton>
                </frame>
            </scrollingframe>
        </surfacegui>
    );
}
