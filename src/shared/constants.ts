import { OnoeNum } from "@antivivi/serikanum";
import { Debris, Players, RunService, SoundService, StarterGui, TextChatService, Workspace } from "@rbxts/services";
import Area from "shared/Area";
import Formula from "shared/utils/Formula";

declare global {
    type AreaId = keyof (typeof AREAS);
}

export const IS_SINGLE_SERVER = game.PlaceId === 17479698702;

export const START_CAMERA = Workspace.WaitForChild("StartCamera") as Part;
export const START_SCREEN_ENABLED = (START_CAMERA.WaitForChild("StartScreen") as BoolValue).Value;

const droplets = RunService.IsServer() ? new Instance("Folder") : Workspace.WaitForChild("Droplets");
droplets.Name = "Droplets";
droplets.Parent = Workspace;
export const DROPLETS_FOLDER = droplets;

const placedItems = RunService.IsServer() ? new Instance("Folder") : Workspace.WaitForChild("PlacedItems");
placedItems.Name = "PlacedItems";
placedItems.Parent = Workspace;
export const PLACED_ITEMS_FOLDER = placedItems;

const reserveModels = RunService.IsServer() ? new Instance("Folder") : Workspace.WaitForChild("ReserveModels");
reserveModels.Name = "ReserveModels";
reserveModels.Parent = Workspace;
export const RESERVE_MODELS_FOLDER = reserveModels;

export const SOUND_EFFECTS_GROUP = SoundService.WaitForChild("SoundEffectsGroup") as SoundGroup;


export const NAMES_PER_USER_ID = new Map<number, string>();
export function getNameFromUserId(userId: number | undefined) {
    if (userId === undefined)
        return "Server";
    const name = NAMES_PER_USER_ID.get(userId);
    if (name !== undefined) {
        return name;
    }
    const [success, value] = pcall(() => Players.GetNameFromUserIdAsync(userId));
    if (!success) {
        return "no name";
    }
    NAMES_PER_USER_ID.set(userId, value);
    return value;
}

/**
 * Get the XP required to get to the next level
 * 
 * @param currentLevel The current level
 */
export function getMaxXp(currentLevel: number) {
    return math.floor((math.pow(1.1, currentLevel + 25) * 80 - 853) / 10 + 0.5) * 10; // <----- worst garbage ever written
}

export const AREAS = {
    BarrenIslands: new Area(Workspace.WaitForChild("BarrenIslands"), true),
    SlamoVillage: new Area(Workspace.WaitForChild("SlamoVillage"), true),
    SecretLab: new Area(Workspace.WaitForChild("SecretLab"), false),
    MagicalHideout: new Area(Workspace.WaitForChild("MagicalHideout"), false),
    ToxicWaterfall: new Area(Workspace.WaitForChild("ToxicWaterfall"), false),
};

export type UpgradeBoardUpgradeOption = Frame & {
    AmountLabel: TextLabel,
    ImageButton: ImageButton;
};

export type UpgradeBoardPurchaseOption = Frame & {
    Button: TextButton & {
        AmountLabel: TextLabel;
    },
    CostLabel: TextLabel;
};

export type QuestOption = Frame & {
    UIStroke: UIStroke;
    Content: Frame & {
        CurrentStepLabel: TextLabel,
        RewardLabel: TextLabel,
        LengthLabel: TextLabel,
        Track: TextButton & {
            UIStroke: UIStroke;
        };
    },
    Dropdown: TextButton & {
        ImageLabel: ImageLabel,
        LevelLabel: TextLabel & {
            UIStroke: UIStroke;
        },
        NameLabel: TextLabel & {
            UIStroke: UIStroke;
        };
    };
};

export const ASSETS = StarterGui.WaitForChild("Assets") as Folder & {
    BalanceWindow: Folder & {
        BalanceOption: BalanceOption;
    },
    EmpiresWindow: Folder & {
        PlayerSlot: Frame & {
            Avatar: ImageLabel;
        },
        EmpireOption: TextButton & {
            UIStroke: UIStroke,
            EmpireIDLabel: TextLabel,
            EmpireInformation: Frame & {
                OwnerAvatar: ImageLabel,
                Labels: Frame & {
                    TitleLabel: TextLabel,
                    OwnerLabel: TextLabel,
                };
            },
            Stats: Frame & {
                DateCreatedLabel: TextLabel,
                ItemsLabel: TextLabel,
                PlaytimeLabel: TextLabel,
            },
        },
        NewEmpireOption: TextButton & {
            MessageLabel: TextLabel;
        },
    },
    QuestsWindow: Folder & {
        QuestOption: QuestOption;
    };
    VFX: Folder;
    Droplet: Folder & {
        DropletGui: BillboardGui & {
            ValueLabel: TextLabel;
        },

    };
    ItemListContainer: Folder & {
        DifficultyOption: DifficultyOption,
        ItemSlot: ItemSlot;
    };
    Sounds: Folder & {
        [key: string]: Sound;
    };
    NPCTextSounds: Folder;
    LeaderboardSlot: LeaderboardSlot;
    CommandOption: Frame & {
        AliasLabel: TextLabel,
        DescriptionLabel: TextLabel,
        PermLevelLabel: TextLabel;
    },
    UpgradeBoard: Folder & {
        UpgradeActionsGui: UpgradeActionsGui,
        UpgradeOptionsGui: SurfaceGui,
        PurchaseOption: UpgradeBoardPurchaseOption,
        UpgradeOption: UpgradeBoardUpgradeOption;
    },
    SettingsWindow: Folder & {
        HotkeyOption: HotkeyOption;
    },
    LogOption: Frame & {
        DetailsLabel: TextLabel,
        TimestampLabel: TextLabel;
    },
    ChargerRing: Beam,
    ArrowBeam: Beam,
    ClassicSword: Tool,
    MostBalanceStat: Frame & {
        AmountLabel: TextLabel,
        StatLabel: TextLabel;
    },
    NPCNotification: BillboardGui & {
        ImageLabel: ImageLabel;
    },
    Resets: Folder,
    Chest: Model & {
        Lid: Model,
        Base: Model,
        Hitbox: BasePart & {
            CooldownGui: BillboardGui & {
                CooldownLabel: TextLabel;
            };
        };
    },
    LootTableItemSlot: Frame & {
        ViewportFrame: ViewportFrame,
        TitleLabel: TextLabel,
        Background: Folder & {
            ImageLabel: ImageLabel;
        };
    },
    ShopWindow: Frame & {
        PriceOptionsContainer: Frame,
        PriceOption: Frame & {
            ImageLabel: ImageLabel,
            ViewportFrame: ViewportFrame,
            AmountLabel: TextLabel,
        };
    },
    ToolOption: ItemSlot & {
        UIStroke: UIStroke,
    },
    HarvestableGui: BillboardGui & {
        HealthBar: Bar,
        NameLabel: TextLabel;
    },
    Effects: Folder,
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
    },
    ChallengeOption: Frame & {
        Description: Frame & {
            DescriptionLabel: TextLabel,
            NoticeLabel: TextLabel,
            RequirementLabel: TextLabel;
        },
        StartButton: TextButton & {
            Label: TextLabel;
        },
        RewardLabel: TextLabel,
        TitleLabel: TextLabel & {
            UIGradient: UIGradient;
        };
    };
};
export function getSound(soundName: string) {
    return ASSETS.Sounds.WaitForChild(soundName + "Sound") as Sound;
}

export function emitEffect(effectName: string, parent: Instance | undefined, amount = 1) {
    const effect = ASSETS.Effects.WaitForChild(effectName + "Effect").Clone() as ParticleEmitter;
    effect.Enabled = false;
    effect.Parent = parent;
    effect.Emit(amount);
    Debris.AddItem(effect, 4);
    return effect;
}

export type HotkeyOption = Frame & {
    Bind: TextButton & {
        KeybindLabel: TextLabel;
    },
    TitleLabel: TextLabel;
};

export type ItemSlot = TextButton & {
    UIStroke: UIStroke,
    Frame: Frame,
    AmountLabel: TextLabel,
    ViewportFrame: ViewportFrame & {
        Camera: Camera;
    },
    ImageLabel: ImageLabel;
};

export type DifficultyOption = Frame & {
    Items: Frame & {
        UIGridLayout: UIGridLayout;
    },
    Dropdown: TextButton & {
        ImageLabel: ImageLabel,
        DifficultyLabel: TextLabel;
    };
};

export type LeaderboardSlot = Frame & {
    AmountLabel: TextLabel;
    PlaceLabel: TextLabel;
    ServerLabel: TextLabel;
};

export type Leaderboard = Model & {
    GuiPart: Part & {
        SurfaceGui: SurfaceGui & {
            Display: ScrollingFrame;
        };
    };
};

export const LEADERBOARDS = Workspace.WaitForChild("Leaderboards") as Folder & {
    TimePlayed: Leaderboard;
    Funds: Leaderboard;
    Power: Leaderboard;
    Skill: Leaderboard;
    Donated: Leaderboard & {
        DonationPart: Part & {
            SurfaceGui: SurfaceGui & {
                Display: ScrollingFrame;
            };
        };
    };
};

export const WAYPOINTS = Workspace.WaitForChild("Waypoints") as Folder;
export const getWaypoint = (waypoint: string) => WAYPOINTS.WaitForChild(waypoint) as BasePart;
export const NPCS = script.Parent?.WaitForChild("npcs") as Folder;
export const NPC_MODELS = Workspace.WaitForChild("NPCs") as Folder;
export const getNPCModel = (npc: string) => NPC_MODELS.WaitForChild(npc) as Model;
export const getNPCPosition = (npc: string) => getNPCModel(npc).PrimaryPart?.Position;
export const getDisplayName = (humanoid: Humanoid) => humanoid.DisplayName === "" ? (humanoid.Parent?.Name ?? "???") : humanoid.DisplayName;

export const DONATION_PRODUCTS = [
    {
        amount: 5,
        id: 1779030516
    },
    {
        amount: 10,
        id: 1779030651
    },
    {
        amount: 25,
        id: 1779030829
    },
    {
        amount: 100,
        id: 1779031038
    },
    {
        amount: 250,
        id: 1779031277
    },
    {
        amount: 1000,
        id: 1779031582
    },
    {
        amount: 2500,
        id: 1779031773
    },
    {
        amount: 10000,
        id: 1779031920
    },
];

export type BombsBoardGui = SurfaceGui & {
    BuyButton: TextButton,
    UseButton: TextButton,
    AmountLabel: TextLabel,
};

export const TEXT_CHANNELS = TextChatService.WaitForChild("TextChannels") as Folder;

export const BOMBS_PRODUCTS = {
    Funds: 1826607791
};

export const RESET_LAYERS = {
    Skillification: {
        order: 1,
        area: AREAS.BarrenIslands,
        formula: new Formula().add(1).div(1e+12).log(16).pow(1.8).add(1),
        minimum: new OnoeNum(1e+12),
        scalesWith: "Power" as Currency,
        gives: "Skill" as Currency,
        resettingCurrencies: ["Funds", "Power", "Purifier Clicks"] as Currency[],
        resettingUpgrades: ["MoreFunds", "MorePower"],
        badgeId: 1485187140296844,

        gainLabel: AREAS.SlamoVillage.areaFolder.WaitForChild("SkillifyBoard").WaitForChild("SurfaceGui")
            .WaitForChild("DifficultyLabel").WaitForChild("Frame").WaitForChild("GainLabel") as TextLabel,
        touchPart: AREAS.SlamoVillage.areaFolder.WaitForChild("Skillification") as BasePart & {
            BillboardGui: BillboardGui & {
                TextLabel: TextLabel;
            };
        },
        tpLocation: AREAS.SlamoVillage.spawnLocation!,
    }
};

export const CHALLENGE_GUI = AREAS.SlamoVillage.areaFolder.WaitForChild("ChallengesBoard").FindFirstChildOfClass("SurfaceGui");
export const CHALLENGE_OPTIONS = CHALLENGE_GUI?.FindFirstChildOfClass("ScrollingFrame");
export const CURRENT_CHALLENGE_WINDOW = CHALLENGE_GUI!.WaitForChild("CurrentChallenge") as Frame & {
    LeaveButton: TextButton,
    RequirementLabel: TextLabel,
    TitleLabel: TextLabel & {
        UIGradient: UIGradient
    };
};