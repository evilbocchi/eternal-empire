import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { TweenService } from "@rbxts/services";
import { ASSETS, getSound } from "shared/constants";
import Item from "shared/item/Item";
import Packets from "shared/network/Packets";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface ItemTypes {
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
}

class Printer extends Item {

    area: AreaId | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Printer");
        this.onLoad((model) => {
            const saveEvent = new Instance("RemoteFunction");
            saveEvent.Name = "Save";
            const loadEvent = new Instance("RemoteFunction");
            loadEvent.Name = "Load";
            if (this.area === undefined)
                error("No area");
            saveEvent.OnServerInvoke = (player, name) => {
                print("Saved", this.area, name);
                if (this.area === undefined)
                    error("No area");
                return GameUtils.saveSetup(player, this.area, name as string) !== undefined;
            };
            loadEvent.OnServerInvoke = (player, name) => {
                print("Loaded", name);
                const success = GameUtils.loadSetup(player, name as string);
                return success;
            };
            saveEvent.Parent = model;
            loadEvent.Parent = model;
        }).onClientLoad((model) => {
            const fill = model.WaitForChild("Fill") as BasePart;
            const saveEvent = model.WaitForChild("Save") as RemoteFunction;
            const loadEvent = model.WaitForChild("Load") as RemoteFunction;
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
                    playSoundAtPart(model.PrimaryPart, getSound("MagicSprinkle"));
            });
            templateSetupOption.Parent = setupOptions;
            const connection = Packets.printedSetups.observe((value) => {
                let i = 0;
                for (const setup of value) {
                    if (setup.area !== this.area)
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
                                playSoundAtPart(model.PrimaryPart, getSound("MagicSprinkle"));
                        });
                        setupOption.Body.LoadButton.Activated.Connect(() => {
                            if (loadEvent.InvokeServer(name) as unknown === true)
                                playSoundAtPart(model.PrimaryPart, getSound("MagicSprinkle"));
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

                    let totalPrice = new Price();
                    for (const [currency, cost] of setup.calculatedPrice)
                        totalPrice.setCost(currency, new OnoeNum(cost));
                    setupOption.Heading.CostLabel.Text = totalPrice.toString();
                    setupOption.Body.LoadButton.Visible = !totalPrice.costPerCurrency.isEmpty();

                    const autoloads = setup.autoloads;
                    TweenService.Create(setupOption.Body.Autoload.ToggleButton.Frame, new TweenInfo(0.5), {
                        Position: new UDim2(autoloads ? 0.7 : 0, autoloads ? -4 : 4, 0.5, 0),
                        BackgroundColor3: autoloads ? Color3.fromRGB(170, 255, 127) : Color3.fromRGB(255, 79, 79)
                    }).Play();
                    ++i;
                }
                fill.Transparency = i > 0 ? 0.25 : 0.8;
            });
            model.Destroying.Once(() => connection.disconnect());
        });
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

export = Printer;