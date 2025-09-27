import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PlayerListPanel from "client/components/playerlist/PlayerListPanel";
import { PlayerRosterEntry } from "client/components/playerlist/PlayerListRow";
import { TweenService, Workspace } from "@rbxts/services";

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

const MOCK_PLAYERS: readonly PlayerRosterEntry[] = [
    {
        userId: 101,
        displayName: "Aurora Synthesis",
        username: "AuroraSynth",
        area: "Slamo Village",
        donated: 1250,
        accountAgeDays: 1890,
        isLocal: true,
        isDeveloper: false,
        thumbnail: "rbxassetid://12187368625",
        joinOrder: 0,
    },
    {
        userId: 202,
        displayName: "Cipher Branch",
        username: "CipherBranch",
        area: "Eden",
        donated: 325,
        accountAgeDays: 860,
        isLocal: false,
        isDeveloper: true,
        thumbnail: "rbxassetid://12187368625",
        joinOrder: 1,
    },
    {
        userId: 303,
        displayName: "Nova Prospect",
        username: "NovaProspect",
        area: "Abandoned Rig",
        donated: 0,
        accountAgeDays: 540,
        isLocal: false,
        isDeveloper: false,
        thumbnail: "rbxassetid://12187368625",
        joinOrder: 2,
    },
    {
        userId: 404,
        displayName: "Flux Metric",
        username: "FluxMetric",
        area: "Barren Islands",
        donated: 58,
        accountAgeDays: 126,
        isLocal: false,
        isDeveloper: false,
        thumbnail: "rbxassetid://12187368625",
        joinOrder: 3,
    },
] as const;

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            highlightLocal: true,
            showDevelopers: true,
            playerCount: 4,
        },
    },
    (props) => {
        const { visible, highlightLocal, showDevelopers } = props.controls;
        const playerCount = math.clamp(math.floor(props.controls.playerCount), 0, MOCK_PLAYERS.size());

        const roster = new Array<PlayerRosterEntry>();
        for (let index = 0; index < playerCount; index++) {
            const template = MOCK_PLAYERS[index];
            roster.push({
                ...template,
                isLocal: template.isLocal && highlightLocal,
                isDeveloper: template.isDeveloper && showDevelopers,
            });
        }

        const [rendered, setRendered] = React.useState(visible);
        const [progress, setProgress] = React.useBinding(visible ? 1 : 0);
        const progressRef = React.useRef(visible ? 1 : 0);
        const [layout, setLayout] = React.useState<PanelLayout>(() => computePanelLayout());

        React.useEffect(() => {
            if (visible) {
                setRendered(true);
            }

            const driver = new Instance("NumberValue");
            driver.Value = progressRef.current;

            const tween = TweenService.Create(
                driver,
                new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                { Value: visible ? 1 : 0 },
            );

            const changed = driver.Changed.Connect(() => {
                const value = driver.Value;
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
                driver.Destroy();
            };
        }, [visible]);

        React.useEffect(() => {
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
                players={roster}
                visible={rendered}
                progress={progress}
                size={layout.size}
                slideOffset={layout.slideOffset}
            />
        );
    },
);
