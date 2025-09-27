import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Players, TweenService, Workspace } from "@rbxts/services";
import PlayerListPanel from "client/components/playerlist/PlayerListPanel";
import { PlayerRosterEntry } from "client/components/playerlist/PlayerListRow";
import { useHotkey } from "client/components/hotkeys/HotkeyManager";
import { useDocument } from "client/components/window/DocumentManager";
import { LOCAL_PLAYER } from "client/constants";

const THUMBNAIL_CACHE = new Map<number, string>();
const DEFAULT_PANEL_SIZE = new UDim2(0, 410, 0, 420);
const OFFSCREEN_PADDING = 56;
const WIDTH_RATIO = 0.5;
const HEIGHT_RATIO = 0.6;
const MIN_PANEL_WIDTH = 300;
const MAX_PANEL_WIDTH = 410;
const MIN_PANEL_HEIGHT = 300;
const MAX_PANEL_HEIGHT = 420;

interface PanelLayout {
    size: UDim2;
    slideOffset: number;
}

function getLeaderstatString(player: Player, name: string) {
    const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
    if (!leaderstats) return undefined;
    const valueObject = leaderstats.FindFirstChild(name);
    if (valueObject && valueObject.IsA("StringValue")) {
        return valueObject.Value;
    }
    return undefined;
}

function getLeaderstatNumber(player: Player, name: string) {
    const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
    if (!leaderstats) return undefined;
    const valueObject = leaderstats.FindFirstChild(name);
    if (valueObject && (valueObject.IsA("IntValue") || valueObject.IsA("NumberValue"))) {
        return valueObject.Value;
    }
    return undefined;
}

function getThumbnail(player: Player) {
    const cached = THUMBNAIL_CACHE.get(player.UserId);
    if (cached !== undefined) {
        return cached;
    }

    const [success, content, ready] = pcall(() =>
        Players.GetUserThumbnailAsync(player.UserId, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size100x100),
    );

    if (success && ready === true) {
        const thumbnail = content as string;
        THUMBNAIL_CACHE.set(player.UserId, thumbnail);
        return thumbnail;
    }

    return undefined;
}

function buildRoster(): PlayerRosterEntry[] {
    const roster = new Array<PlayerRosterEntry>();
    const currentPlayers = Players.GetPlayers();

    for (let index = 0; index < currentPlayers.size(); index++) {
        const player = currentPlayers[index];
        roster.push({
            userId: player.UserId,
            displayName: player.DisplayName,
            username: player.Name,
            area: getLeaderstatString(player, "Area") ?? "Unknown",
            donated: getLeaderstatNumber(player, "Donated") ?? 0,
            accountAgeDays: player.AccountAge,
            isLocal: player === LOCAL_PLAYER,
            isDeveloper: player.GetAttribute("Developer") === true,
            thumbnail: getThumbnail(player),
            joinOrder: index,
        });
    }

    roster.sort((a, b) => {
        if (a.isLocal !== b.isLocal) {
            return a.isLocal;
        }
        if (a.isDeveloper !== b.isDeveloper) {
            return a.isDeveloper;
        }
        if (a.donated !== b.donated) {
            return a.donated > b.donated;
        }
        if (a.displayName !== b.displayName) {
            return a.displayName.lower() < b.displayName.lower();
        }
        return a.joinOrder < b.joinOrder;
    });

    return roster;
}

function computePanelLayout(): PanelLayout {
    const camera = Workspace.CurrentCamera;
    if (!camera) {
        return {
            size: DEFAULT_PANEL_SIZE,
            slideOffset: DEFAULT_PANEL_SIZE.X.Offset + OFFSCREEN_PADDING,
        };
    }

    const viewport = camera.ViewportSize;
    const width = math.clamp(math.floor(viewport.X * WIDTH_RATIO), MIN_PANEL_WIDTH, MAX_PANEL_WIDTH);
    const height = math.clamp(math.floor(viewport.Y * HEIGHT_RATIO), MIN_PANEL_HEIGHT, MAX_PANEL_HEIGHT);
    const size = new UDim2(0, width, 0, height);

    return {
        size,
        slideOffset: width + OFFSCREEN_PADDING,
    };
}

export default function PlayerListContainer() {
    const { visible, setVisible } = useDocument({ id: "PlayerList", defaultVisible: false, priority: -1 });
    const [players, setPlayers] = useState<PlayerRosterEntry[]>(() => buildRoster());
    const [rendered, setRendered] = useState(visible);
    const [progress, setProgress] = React.useBinding(visible ? 1 : 0);
    const progressRef = useRef(visible ? 1 : 0);
    const [layout, setLayout] = useState<PanelLayout>(() => computePanelLayout());

    useHotkey(
        {
            label: "Player List",
            action: () => {
                setVisible(true);
                return true;
            },
            endAction: () => {
                setVisible(false);
                return true;
            },
        },
        [setVisible],
    );

    useEffect(() => {
        let alive = true;

        const update = () => setPlayers(buildRoster());
        update();

        const addedConnection = Players.PlayerAdded.Connect(update);
        const removingConnection = Players.PlayerRemoving.Connect(update);

        task.spawn(() => {
            while (alive) {
                task.wait(1.25);
                update();
            }
        });

        return () => {
            alive = false;
            addedConnection.Disconnect();
            removingConnection.Disconnect();
        };
    }, []);

    useEffect(() => {
        if (visible) {
            setPlayers(buildRoster());
            setRendered(true);
        }

        const numberValue = new Instance("NumberValue");
        numberValue.Value = progressRef.current;

        const tween = TweenService.Create(
            numberValue,
            new TweenInfo(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            { Value: visible ? 1 : 0 },
        );

        const changed = numberValue.Changed.Connect(() => {
            const value = numberValue.Value;
            progressRef.current = value;
            setProgress(value);
        });

        const completed = tween.Completed.Connect((status) => {
            if (!visible && status === Enum.PlaybackState.Completed) {
                setRendered(false);
            }
        });

        tween.Play();

        return () => {
            tween.Cancel();
            changed.Disconnect();
            completed.Disconnect();
            numberValue.Destroy();
        };
    }, [visible]);

    useEffect(() => {
        let viewportConnection: RBXScriptConnection | undefined;

        const updateLayout = () => {
            const computed = computePanelLayout();
            setLayout((prev) => {
                if (
                    prev.size.X.Offset === computed.size.X.Offset &&
                    prev.size.Y.Offset === computed.size.Y.Offset &&
                    prev.slideOffset === computed.slideOffset
                ) {
                    return prev;
                }
                return computed;
            });
        };

        const bindViewport = () => {
            viewportConnection?.Disconnect();
            const camera = Workspace.CurrentCamera;
            if (camera) {
                viewportConnection = camera.GetPropertyChangedSignal("ViewportSize").Connect(updateLayout);
            }
            updateLayout();
        };

        const cameraConnection = Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(bindViewport);
        bindViewport();

        return () => {
            cameraConnection.Disconnect();
            viewportConnection?.Disconnect();
        };
    }, []);

    return (
        <PlayerListPanel
            players={players}
            visible={rendered}
            progress={progress}
            size={layout.size}
            slideOffset={layout.slideOffset}
        />
    );
}
