import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { TweenService } from "@rbxts/services";
import { getSound } from "shared/asset/GameAssets";
import { ASSETS } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { Server } from "shared/item/ItemUtils";
import { playSoundAtPart } from "@antivivi/vrldk";

declare global {
    interface ItemTraits {
        Printer: Printer;
    }

    interface Setup {
        name: string,
        area: AreaId,
        autoloads: boolean,
        calculatedPrice: Map<Currency, BaseOnoeNum>,
        items: Array<PlacedItem>,
        alerted: boolean;
    }

    interface Assets {
        SetupOption: Frame & {
            Heading: Frame & {
                EditButton: ImageButton,
                NameLabel: TextBox & {
                    Frame: Frame;
                },
                CostLabel: TextLabel;
            },
            Body: Frame & {
                Autoload: Frame & {
                    ToggleButton: TextButton & {
                        Frame: Frame;
                    },
                    TextLabel: TextLabel;
                },
                LoadButton: TextButton,
                SaveButton: TextButton;
            };
        };
    }
}

export default class Printer extends ItemTrait {

    static load(model: Model, printer: Printer) {
        const SetupService = Server.Setup;

        const saveEvent = new Instance("RemoteFunction");
        saveEvent.Name = "Save";
        const loadEvent = new Instance("RemoteFunction");
        loadEvent.Name = "Load";
        if (printer.area === undefined)
            error("No area");

        let debounce = 0;
        saveEvent.OnServerInvoke = (player, name) => {
            if (tick() - debounce < 1) {
                return false;
            }
            debounce = tick();

            print("Saved", printer.area, name);
            if (printer.area === undefined)
                error("No area");
            return SetupService.saveSetup(player, printer.area, name as string) !== undefined;
        };
        loadEvent.OnServerInvoke = (player, name) => {
            if (tick() - debounce < 1) {
                return false;
            }
            debounce = tick();

            print("Loaded", name);
            const success = SetupService.loadSetup(player, name as string);
            return success;
        };
        saveEvent.Parent = model;
        loadEvent.Parent = model;
    }

    static clientLoad(model: Model, printer: Printer) {
        const saveEvent = model.WaitForChild("Save") as RemoteFunction;
        const loadEvent = model.WaitForChild("Load") as RemoteFunction;
        const fill = model.WaitForChild("Fill", math.huge) as BasePart;
        const setupOptions = model.WaitForChild("GuiPart").WaitForChild("SurfaceGui").WaitForChild("SetupOptions");

        const templateSetupOption = ASSETS.SetupOption.Clone();
        templateSetupOption.Name = "Template";
        templateSetupOption.LayoutOrder = 95211925;
        templateSetupOption.Body.Autoload.Visible = false;
        templateSetupOption.Body.LoadButton.Visible = false;
        templateSetupOption.Heading.NameLabel.TextEditable = true;
        templateSetupOption.Heading.NameLabel.Frame.Visible = true;
        templateSetupOption.Heading.EditButton.Visible = false;
        templateSetupOption.Heading.CostLabel.Visible = false;
        const printedSetups = Packets.printedSetups.get();
        templateSetupOption.Heading.NameLabel.Text = "Setup " + (printedSetups === undefined ? "1" : (printedSetups.size() + 1));
        templateSetupOption.Body.SaveButton.Activated.Connect(() => {
            if (saveEvent.InvokeServer(templateSetupOption.Heading.NameLabel.Text) as unknown === true)
                playSoundAtPart(model.PrimaryPart, getSound("MagicSprinkle.mp3"));
        });
        templateSetupOption.Parent = setupOptions;

        const connection = Packets.printedSetups.observe((value) => {
            let i = 0;
            for (const setup of value) {
                if (setup.area !== printer.area || setupOptions === undefined)
                    continue;

                const name = setup.name;
                const cached = setupOptions.FindFirstChild(name);
                let setupOption: typeof ASSETS.SetupOption;
                if (cached !== undefined) {
                    setupOption = cached as typeof ASSETS.SetupOption;
                }
                else {
                    setupOption = ASSETS.SetupOption.Clone();
                    setupOption.Heading.NameLabel.Text = name;
                    setupOption.Name = name;
                    setupOption.LayoutOrder = i;
                    setupOption.Body.SaveButton.Activated.Connect(() => {
                        if (saveEvent.InvokeServer(name) as unknown === true)
                            playSoundAtPart(model.PrimaryPart, getSound("MagicSprinkle.mp3"));
                    });
                    setupOption.Body.LoadButton.Activated.Connect(() => {
                        if (loadEvent.InvokeServer(name) as unknown === true)
                            playSoundAtPart(model.PrimaryPart, getSound("MagicSprinkle.mp3"));
                    });
                    const toggleEditable = (isEditable = !setupOption.Heading.NameLabel.TextEditable) => {
                        setupOption.Heading.NameLabel.TextEditable = isEditable;
                        setupOption.Heading.NameLabel.Frame.Visible = isEditable;
                    };
                    setupOption.Heading.EditButton.Activated.Connect(() => {
                        toggleEditable();
                        setupOption.Heading.NameLabel.CaptureFocus();
                    });
                    setupOption.Heading.NameLabel.FocusLost.Connect((enterPressed) => {
                        if (enterPressed === true) {
                            Packets.renameSetup.inform(name, setupOption.Heading.NameLabel.Text);
                            setupOption.Destroy();
                            return;
                        }
                        toggleEditable(false);
                    });
                    setupOption.Body.Autoload.ToggleButton.Activated.Connect(() => Packets.autoloadSetup.inform(name));
                    setupOption.Parent = setupOptions;
                }

                let totalPrice = new CurrencyBundle();
                for (const [currency, amount] of setup.calculatedPrice)
                    totalPrice.set(currency, new OnoeNum(amount));
                setupOption.Heading.CostLabel.Text = totalPrice.toString();
                setupOption.Body.LoadButton.Visible = !totalPrice.amountPerCurrency.isEmpty();

                const autoloads = setup.autoloads;
                TweenService.Create(setupOption.Body.Autoload.ToggleButton.Frame, new TweenInfo(0.5), {
                    Position: new UDim2(autoloads ? 0.7 : 0, autoloads ? -4 : 4, 0.5, 0),
                    BackgroundColor3: autoloads ? Color3.fromRGB(170, 255, 127) : Color3.fromRGB(255, 79, 79)
                }).Play();
                ++i;
            }
            if (fill !== undefined)
                fill.Transparency = i > 0 ? 0.25 : 0.8;
        });
        model.Destroying.Once(() => connection.disconnect());
    }

    area: AreaId | undefined;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Printer.load(model, this));
        item.onClientLoad((model) => Printer.clientLoad(model, this));
    }

    setArea(area: AreaId) {
        this.area = area;
        return this;
    }

    static getPrintedSetupsInArea(printedSetups: Map<string, Setup>, area: AreaId) {
        const setups = new Map<string, Setup>();
        for (const [name, setup] of printedSetups)
            if (setup.area === area)
                setups.set(name, setup);
        return setups;
    }
}