import { StarterGui, Workspace } from "@rbxts/services";
import Area from "shared/Area";

export const START_CAMERA = Workspace.WaitForChild("StartCamera") as Part;
export const START_SCREEN_ENABLED = (START_CAMERA.WaitForChild("StartScreen") as BoolValue).Value;

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
    placed: PlacedItem[]
}

export const AREAS = {
    BarrenIslands: new Area(Workspace.WaitForChild("BarrenIslands")),
    //SlamoVillage: new Area(Workspace.WaitForChild("SlamoVillage")),
}

export type Currency = "Funds" | "Power" | "Bitcoin";

export type Balance = {[currency in Currency]: number};

export type BalanceOption = Frame & {
	BalanceLabel: TextLabel,
	CurrencyLabel: TextLabel,
	IncomeLabel: TextLabel,
	UIStroke: UIStroke,
};

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
		}
	},
	Droplet: Folder & {
		DropletGui: BillboardGui & {
			Main: CanvasGroup
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
	}
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

export const LEADERBOARDS = Workspace.WaitForChild("Leaderboards") as Folder & {
	TimePlayed: Leaderboard;
	Funds: Leaderboard;
	Power: Leaderboard;
	Donated: Leaderboard & {
		DonationPart: Part & {
			SurfaceGui: SurfaceGui & {
				Display: ScrollingFrame;
			}
		}
	};
};

export const DONATION_PRODUCTS = [
	{
		amount: 5,
		id: 1774168434
	},
	{
		amount: 10,
		id: 1774168551
	},
	{
		amount: 25,
		id: 1774168648
	},
	{
		amount: 100,
		id: 1774168786
	},
	{
		amount: 250,
		id: 1774168874
	},
	{
		amount: 1000,
		id: 1774169531
	},
	{
		amount: 2500,
		id: 1774170067
	},
	{
		amount: 10000,
		id: 1774170563
	},
]