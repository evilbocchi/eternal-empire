import { Players, RunService, StarterGui, Workspace } from "@rbxts/services";
import Area from "shared/Area";
import InfiniteMath from "./utils/infinitemath/InfiniteMath";

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

const reserveModels = new Instance("Folder");
reserveModels.Name = "ReserveModels";
reserveModels.Parent = Workspace;
export const RESERVE_MODELS_FOLDER = reserveModels;

export const NAMES_PER_USER_ID = new Map<number, string>();
export function getNameFromUserId(userId: number) {
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

export type PlacedItem = {
    placementId?: string,
    item: string,
    posX: number,
    posY: number,
    posZ: number,
    rotX: number,
    rotY: number,
    rotZ: number,
	rawRotation: number,
	direction?: boolean,
    area: string
}

export type EmpireInfo = {
	name: string,
	owner: number,
	items: number,
	created: number,
	playtime: number,
}

export type Inventory = Map<string, number>;

export type ItemsData = {
    inventory: Inventory,
    bought: Inventory,
    placed: PlacedItem[],
	nextId: number,
}

export const AREAS = {
    BarrenIslands: new Area(Workspace.WaitForChild("BarrenIslands"), true),
    SlamoVillage: new Area(Workspace.WaitForChild("SlamoVillage"), true),
	SecretLab: new Area(Workspace.WaitForChild("SecretLab"), false),
}

export type Balance = {[currency in Currency]: number};

export type BalanceOption = Frame & {
	BalanceLabel: TextLabel,
	CurrencyLabel: TextLabel,
	IncomeLabel: TextLabel,
	UIStroke: UIStroke,
};

export type UpgradeActionsGui = SurfaceGui & {
	PurchaseOptions: Frame,
	ImageLabel: ImageLabel,
	DescriptionLabel: TextLabel,
	TitleLabel: TextLabel,
	AmountLabel: TextLabel
}

export type UpgradeBoardUpgradeOption = Frame & {
	AmountLabel: TextLabel,
	ImageButton: ImageButton
}

export type UpgradeBoardPurchaseOption = Frame & {
	Button: TextButton & {
		AmountLabel: TextLabel
	},
	CostLabel: TextLabel
}

export type QuestOption = Frame & {
	UIStroke: UIStroke
	Content: Frame & {
		CurrentStepLabel: TextLabel,
		RewardLabel: TextLabel,
		LengthLabel: TextLabel,
		Track: TextButton & {
			UIStroke: UIStroke
		}
	},
	Dropdown: TextButton & {
		ImageLabel: ImageLabel,
		LevelLabel: TextLabel,
		NameLabel: TextLabel & {
			UIStroke: UIStroke
		}
	}
}

export const UI_ASSETS = StarterGui.WaitForChild("Assets") as Folder & {
	BalanceWindow: Folder & {
		BalanceOption: BalanceOption
	},
	EmpiresWindow: Folder & {
		PlayerSlot: Frame & {
			Avatar: ImageLabel
		},
		EmpireOption: TextButton & {
			UIStroke: UIStroke,
			EmpireIDLabel: TextLabel,
			EmpireInformation: Frame & {
				OwnerAvatar: ImageLabel,
				Labels: Frame & {
					TitleLabel: TextLabel,
					OwnerLabel: TextLabel,
				}
			},
			Stats: Frame & {
				DateCreatedLabel: TextLabel,
				ItemsLabel: TextLabel,
				PlaytimeLabel: TextLabel,
			},
		},
		NewEmpireOption: TextButton & {
			MessageLabel: TextLabel
		},
	},
	QuestsWindow: Folder & {
		QuestOption: QuestOption;
	}
	Droplet: Folder & {
		DropletGui: BillboardGui & {
			Main: Frame
		},
		CurrencyLabel: TextLabel
	}
	ItemListContainer: Folder & {
		DifficultyOption: DifficultyOption,
		ItemSlot: ItemSlot
	}
	Sounds: Folder & {
		[key: string]: Sound
	}
	LeaderboardSlot: LeaderboardSlot;
	CommandOption: Frame & {
		AliasLabel: TextLabel,
		DescriptionLabel: TextLabel,
		PermLevelLabel: TextLabel
	},
	UpgradeBoard: Folder & {
		UpgradeActionsGui: UpgradeActionsGui,
		UpgradeOptionsGui: SurfaceGui,
		PurchaseOption: UpgradeBoardPurchaseOption,
		UpgradeOption: UpgradeBoardUpgradeOption
	},
	SettingsWindow: Folder & {
		HotkeyOption: HotkeyOption
	},
	LogOption: Frame & {
		DetailsLabel: TextLabel,
		TimestampLabel: TextLabel
	},
	ArrowBeam: Beam,
	ClassicSword: Tool,
	MostBalanceStat: Frame & {
		AmountLabel: TextLabel,
		StatLabel: TextLabel
	},
	NPCNotification: BillboardGui & {
		ImageLabel: ImageLabel
	},
	Resets: Folder,
}

export type HotkeyOption = Frame & {
	Bind: TextButton & {
		KeybindLabel: TextLabel
	},
	TitleLabel: TextLabel
}

export type ItemSlot = TextButton & {
	UIStroke: UIStroke,
	AmountLabel: TextLabel,
	ViewportFrame: ViewportFrame & {
		Camera: Camera
	}
}

export type DifficultyOption = Frame & {
	Items: Frame,
	Dropdown: TextButton & {
		ImageLabel: ImageLabel,
		DifficultyLabel: TextLabel
	}
}

export type LeaderboardSlot = Frame & {
	AmountLabel: TextLabel;
	PlaceLabel: TextLabel;
	ServerLabel: TextLabel;
}

export type Leaderboard = Model & {
	GuiPart: Part & {
		SurfaceGui: SurfaceGui & {
			Display: ScrollingFrame;
		}
	}
}

export type Log = {
	time: number,
    type: string,
    player: number,
    recipient?: number,
    x?: number,
    y?: number,
    z?: number,
    area?: string,
	upgrade?: string,
	item?: string,
	items?: string[],
	layer?: string,
	amount?: number,
	currency?: Currency,
	infAmount?: InfiniteMath
}

export const LEADERBOARDS = Workspace.WaitForChild("Leaderboards") as Folder & {
	TimePlayed: Leaderboard;
	Funds: Leaderboard;
	Power: Leaderboard;
	Skill: Leaderboard;
	Donated: Leaderboard & {
		DonationPart: Part & {
			SurfaceGui: SurfaceGui & {
				Display: ScrollingFrame;
			}
		}
	};
};

export const NPCS = Workspace.WaitForChild("NPCs") as Folder;

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
}

export const BOMBS_PRODUCTS = {
	Funds: 1826607791
}