import { Players, ReplicatedStorage } from "@rbxts/services";

export const LOCAL_PLAYER = Players.LocalPlayer;
export const MOUSE = LOCAL_PLAYER.GetMouse();
export const PLAYER_GUI = LOCAL_PLAYER.WaitForChild("PlayerGui") as StarterGui;

export const INTERFACE = PLAYER_GUI.WaitForChild("Interface") as ScreenGui;

export const SERVER_INFO_LABEL = INTERFACE.WaitForChild("ServerInfoLabel") as TextLabel;

export const SIDEBAR_BUTTONS = INTERFACE.WaitForChild("SidebarButtons") as Frame;

export const ADAPTIVE_TAB = INTERFACE.WaitForChild("AdaptiveTab") as Frame & {
    CloseButton: TextButton,
	UIStroke: UIStroke & {
		UIGradient: UIGradient
	},
	TitleLabel: TextLabel
};

export const ADAPTIVE_TAB_MAIN_WINDOW = ADAPTIVE_TAB.WaitForChild("MainWindow") as Frame & {
	
};

type ItemListContainer = Frame & {
	ItemList: ScrollingFrame;
}

export const INVENTORY_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Inventory") as ItemListContainer;
export const SHOP_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Shop") as ItemListContainer;

export const PURCHASE_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Purchase") as Frame & {
	Header: Frame & {
		DifficultyLabel: ImageLabel,
		ItemNameLabel: TextLabel
	},
	Body: Frame & {
		ViewportFrame: ViewportFrame,
		ItemInfo: Frame & {
			DescriptionLabel: TextLabel,
			Options: Frame & {
				Purchase: TextButton & {
					PriceLabel: TextLabel
				},
				Back: TextButton
			}
		}
	}
};


export const BALANCE_WINDOW = INTERFACE.WaitForChild("BalanceWindow") as Frame & {
	Balances: ScrollingFrame;
};

export const LOADING_WINDOW = INTERFACE.WaitForChild("LoadingWindow") as Frame & {
	MessageLabel: TextLabel;
};

export const START_WINDOW = INTERFACE.WaitForChild("StartWindow") as Frame & {
	EmpiresWindow: Frame & {
		EmpireOptions: ScrollingFrame,
		PublicEmpireWindow: Frame & {
			JoinPublicEmpire: TextButton
		}
	},
	Header: Frame & {
		Logo: ImageLabel
	},
	Footer: CanvasGroup
};

export const BUILD_WINDOW = INTERFACE.WaitForChild("BuildWindow") as CanvasGroup & {
	ModeOptions: Frame & {
		UIListLayout: UIListLayout,
		Dropdown: TextButton & {
			ImageLabel: ImageLabel
		},
		Deselect: TextButton,
		Place: TextButton,
		Rotate: TextButton,
		Delete: TextButton,
	},
	PlacementLabel: TextLabel,
	ModeLabel: TextLabel
};

export const TOOLTIP_WINDOW = INTERFACE.WaitForChild("TooltipWindow") as CanvasGroup & {
	Main: Frame & {
		MessageLabel: TextLabel
	}
}

export const MUTE_BUTTON_WINDOW = INTERFACE.WaitForChild("MuteButtonWindow") as Frame & {
	Button: TextButton,
	SongTitle: TextLabel
}

export type StatContainer = {
	StatLabel: TextLabel;
	AmountLabel: TextLabel;
}

export const STATS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Stats") as Frame & {
	StatList: ScrollingFrame & {
		Playtime: StatContainer;
		SessionTime: StatContainer;
		LongestSessionTime: StatContainer;
	}
};

export const LOADED_ITEM_MODELS = ReplicatedStorage.WaitForChild("LoadedItemModels") as Folder;

export const COMMANDS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Commands") as Frame & {
	CommandsList: ScrollingFrame & {
		
	}
};