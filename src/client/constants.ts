import { Players, ReplicatedStorage } from "@rbxts/services";
import { AREAS } from "shared/constants";

export const LOCAL_PLAYER = Players.LocalPlayer;
export const MOUSE = LOCAL_PLAYER.GetMouse();
export const PLAYER_GUI = LOCAL_PLAYER.WaitForChild("PlayerGui") as StarterGui;

export const INTERFACE = PLAYER_GUI.WaitForChild("Interface") as ScreenGui;

export const SIDEBAR_BUTTONS = INTERFACE.WaitForChild("SidebarButtons") as Frame & {
	Quests: TextButton & {
		NotificationWindow: Frame & {
			AmountLabel: TextLabel
		}
	}
};

export const ADAPTIVE_TAB = INTERFACE.WaitForChild("AdaptiveTab") as Frame & {
    CloseButton: TextButton,
	UIStroke: UIStroke & {
		UIGradient: UIGradient
	},
	TitleLabel: TextLabel
};

export const ADAPTIVE_TAB_MAIN_WINDOW = ADAPTIVE_TAB.WaitForChild("MainWindow") as Frame & {
	
};

export const TRACKED_QUEST_WINDOW = INTERFACE.WaitForChild("TrackedQuestWindow") as Frame & {
	Background: Folder & {
		Frame: Frame
	},
	Completion: Frame & {
		ImageLabel: ImageLabel,
		TextLabel: TextLabel & {
			UIStroke: UIStroke
		},
		RewardLabel: TextLabel & {
			UIStroke: UIStroke
		}
	},
	Reset: Frame & {
		ImageLabel: ImageLabel,
		TextLabel: TextLabel & {
			UIStroke: UIStroke
		},
		AmountLabel: TextLabel & {
			UIStroke: UIStroke
		}
	},
	DescriptionLabel: TextLabel,
	TitleLabel: TextLabel,
	ProgressBar: CanvasGroup & {
		Bar: Frame & {
			UIStroke: UIStroke,
			Fill: Frame,
			BarLabel: TextLabel
		}
	}
}

export const DETAILS_WINDOW = INTERFACE.WaitForChild("DetailsWindow") as Frame & {
	PositionLabel: TextLabel,
	FundsBombLabel: TextLabel,
	SavingDataLabel: TextLabel
}

type ItemListContainer = Frame & {
	ItemList: ScrollingFrame;
}

export const INVENTORY_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Inventory") as ItemListContainer & {
	Empty: Frame
};
export const SHOP_WINDOW = INTERFACE.WaitForChild("ShopWindow") as Frame & {
	UIStroke: UIStroke,
	PurchaseWindow: Frame & {
		ViewportFrame: ViewportFrame,
		Title: Frame & {
			DifficultyLabel: ImageLabel,
			ItemNameLabel: TextLabel
		},
		DescriptionFrame: ScrollingFrame & {
			DescriptionLabel: TextLabel,
			CreatorLabel: TextLabel,
		},
		Purchase: TextButton & {
			Price: Frame,
			HeadingLabel: TextLabel
		},
		CloseButton: TextButton
	},
	ItemListWrapper: Frame & {
		ItemList: ItemListContainer & {
			BuyAll: TextButton,
		}
	}
};

export type NavigationOption = Frame & {
	ImageButton: ImageButton
}

export const BALANCE_WINDOW = INTERFACE.WaitForChild("BalanceWindow") as Frame & {
	Balances: ScrollingFrame & {
		NavigationOptions: Frame & {
			Left: NavigationOption,
			Right: NavigationOption,
			PageLabel: TextLabel
		}
	};
	TitleLabel: TextLabel;
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

export const INTRO_WINDOW = INTERFACE.WaitForChild("IntroWindow") as Frame;

export type BuildOption = TextButton & {
	UIScale: UIScale
}

export const BUILD_WINDOW = INTERFACE.WaitForChild("BuildWindow") as Frame & {
	Deselect: BuildOption,
	Rotate: BuildOption,
	Delete: BuildOption,
};

export const TOOLTIP_WINDOW = INTERFACE.WaitForChild("TooltipWindow") as Frame & {
	UIStroke: UIStroke,
	MessageLabel: TextLabel
}

export type StatContainer = Frame & {
	StatLabel: TextLabel;
	AmountLabel: TextLabel;
}

export const STATS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Stats") as Frame & {
	StatList: ScrollingFrame & {
		Playtime: StatContainer;
		SessionTime: StatContainer;
		LongestSessionTime: StatContainer;
		RawPurifierClicks: StatContainer;
		CurrentPing: StatContainer;
	}
};

const itemModels = new Map<string, Model>();
const loaded = ReplicatedStorage.WaitForChild("LoadedItemModels").GetChildren();
for (const value of loaded) {
	if (value.IsA("ObjectValue")) {
		itemModels.set(value.Name, value.Value as Model);
	}
}
export const ITEM_MODELS = itemModels;

export const COMMANDS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Commands") as Frame & {
	CommandsList: ScrollingFrame & {
		
	}
};

export const SHARE_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Share") as Frame & {
	Code: Frame & {
		Input: TextBox
	}
};

export const SETTINGS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Settings") as Frame & {
	InteractionOptions: Frame & {
		
	}
};

export const LOGS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Logs") as Frame & {
	LogList: Frame,
	NavigationOptions: Frame & {
		Left: NavigationOption,
		Right: NavigationOption,
		PageLabel: TextLabel
	}
};

export const QUESTS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Quests") as Frame & {
	Level: Frame & {
		Current: TextButton & {
			NotificationLabel: ImageLabel,
			LevelLabel: TextLabel
		},
		ProgressBar: Frame & {
			Fill: Frame,
			BarLabel: TextLabel
		}
	},
	QuestList: Frame & {
		
	}
};

export type LPUpgradeOption = Frame & {
	Button: ImageButton & {
		ValueLabel: TextLabel
	},
	DescriptionLabel: TextLabel
}

export const LEVELS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Levels") as Frame & {
	LevelPointOptions: Frame & {
		Respec: TextButton,
		LevelPointsLabel: TextLabel
	},
	UpgradeOptions: Frame & {
		Stone: LPUpgradeOption,
		WhiteGem: LPUpgradeOption,
		Crystal: LPUpgradeOption
	}
};

export const WARP_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Warp") as Frame & {
	[area in keyof (typeof AREAS)]: ImageButton
};

export const DIALOGUE_WINDOW = INTERFACE.WaitForChild("DialogueWindow") as TextButton & {
	NameLabel: TextLabel,
	TextLabel: TextLabel,
	HintLabel: TextLabel,
}