import { Players, ReplicatedFirst, ReplicatedStorage } from "@rbxts/services";
import { findModels } from "shared/utils/vrldk/InstanceUtils";

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

export type CompletionFrame = Frame & {
    ImageLabel: ImageLabel,
    TextLabel: TextLabel & {
        UIStroke: UIStroke
    },
    RewardLabel: TextLabel & {
        UIStroke: UIStroke
    }
}

export const TRACKED_QUEST_WINDOW = INTERFACE.WaitForChild("TrackedQuestWindow") as Frame & {
	Background: Folder & {
		Frame: Frame
	},
	Completion: CompletionFrame,
    ChallengeCompletion: CompletionFrame,
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
		Bar: Bar
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

export const LOADING_SCREEN = PLAYER_GUI.WaitForChild("LoadingScreen") as ScreenGui & {
    LoadingWindow: Frame & {
        Background: ImageLabel;
        Thumbnail: ImageLabel;
        MessageLabel: TextLabel;
    }
};

type StartOption = Frame & {
    Button: ImageButton,
    ImageLabel: ImageLabel,
    Label: TextLabel & {
        UIStroke: UIStroke
    }
}

export const START_WINDOW = ReplicatedFirst.WaitForChild("StartScreen") as ScreenGui & {
    AboutWindow: ScrollingFrame & {
        Contributors: Frame & {
            RecipientLabel: TextLabel
        },
        CloseButton: ImageButton
    },
    MainOptions: Frame & {
        Play: StartOption,
        Settings: StartOption,
        About: StartOption,
    },
	EmpiresWindow: Frame & {
        CloseButton: TextButton,
		EmpireOptions: ScrollingFrame,
		PublicEmpireWindow: Frame & {
			JoinPublicEmpire: TextButton
		}
	},
    LeftBackground: ImageLabel,
	Logo: ImageLabel
};

export const INTRO_WINDOW = INTERFACE.WaitForChild("IntroWindow") as Frame;

export type BuildOption = TextButton & {
	UIScale: UIScale,
    TextLabel: TextLabel,
    ImageLabel: ImageLabel
}

export const BUILD_WINDOW = INTERFACE.WaitForChild("BuildWindow") as Frame & {
	Deselect: BuildOption,
	Options: Frame & {
        Rotate: BuildOption,
	    Delete: BuildOption,
        Place: BuildOption
    }
};

export const TOOLTIP_WINDOW = INTERFACE.WaitForChild("TooltipWindow") as Frame & {
	UIStroke: UIStroke,
	MessageLabel: TextLabel
}

export const BACKPACK_WINDOW = INTERFACE.WaitForChild("BackpackWindow") as Frame & {

};

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

export const ITEM_MODELS = (function() {
    const itemModels = new Map<string, Model>();
    const served = findModels(ReplicatedStorage.WaitForChild("ItemModels"));
    for (const value of served)
        itemModels.set(value.Name, value);
    return itemModels;
})();

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
		ProgressBar: Bar
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
	[area in AreaId]: ImageButton
};

export const DIALOGUE_WINDOW = INTERFACE.WaitForChild("DialogueWindow") as TextButton & {
	NameLabel: TextLabel,
	TextLabel: TextLabel,
	HintLabel: TextLabel,
}

export const RENAME_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Rename") as Frame & {
    PurchaseOptions: Frame & {
        Funds: TextButton & {
            AmountLabel: TextLabel,
        },
        Robux: TextButton,
    },
    Input: Frame & {
        InputBox: TextBox,
        PrefixLabel: TextLabel
    },
    FundsLabel: TextLabel
}

export const CHALLENGE_TASK_WINDOW = TRACKED_QUEST_WINDOW.WaitForChild("ChallengeTaskWindow") as Frame & {
    TitleLabel: TextLabel & {
        UIGradient: UIGradient
    },
    RequirementLabel: TextLabel
}


export const PARALLEL = script.Parent!.FindFirstChildOfClass("Actor")!;