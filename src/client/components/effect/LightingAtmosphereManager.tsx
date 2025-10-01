/**
 * @fileoverview React component for managing unified lighting and atmosphere effects.
 *
 * Handles:
 * - Area-based lighting configurations (base layer)
 * - Weather-based atmospheric modifications (multiplicative/additive layer)
 * - Dynamic light cycling based on time of day and quality settings
 * - Rain effects and visual weather states
 *
 * This component replaces both LightingController and AtmosphereController with a unified
 * React-based approach that properly layers lighting effects without conflicts.
 *
 * @since 1.0.0
 */
import { variableInterval } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useRef } from "@rbxts/react";
import { Lighting } from "@rbxts/services";
import RainParallel from "client/parallel/rain/RainParallel";
import UserGameSettings from "shared/api/UserGameSettings";
import Packets from "shared/Packets";
import { WeatherState, WeatherType } from "shared/weather/WeatherTypes";
import { AREAS } from "shared/world/Area";
import WorldNode from "shared/world/nodes/WorldNode";

interface LightingConfig {
    Ambient?: Color3;
    OutdoorAmbient?: Color3;
    EnvironmentDiffuseScale?: number;
    EnvironmentSpecularScale?: number;
    FogEnd?: number;
    FogStart?: number;
    FogColor?: Color3;
    Brightness?: number;
}

interface WeatherModifiers {
    brightnessMultiplier: number;
    outdoorAmbientModifier?: Color3;
    fogEndOverride?: number;
    lightBrightnessMultiplier: number;
}

/**
 * Component that manages all lighting and atmosphere effects in a unified, layered approach.
 *
 * Lighting layers (applied in order):
 * 1. Default lighting (captured at mount)
 * 2. Area-specific lighting configuration (base layer)
 * 3. Weather modifications (multiplicative/additive effects)
 */
export default function LightingAtmosphereManager() {
    // Store default lighting properties captured at mount
    const defaultLighting = useRef<LightingConfig>({});

    // Current area and weather state
    const currentAreaConfig = useRef<LightingConfig | undefined>(undefined);
    const currentWeather = useRef<WeatherState>({
        type: WeatherType.Clear,
        intensity: 0,
        duration: 300,
        timeRemaining: 300,
    });

    // Dynamic lights that cycle with time of day
    const cyclingLights = useRef(new Map<Light, number>());

    // Cleanup functions
    const cleanupFns = useRef<Array<() => void>>([]);

    useEffect(() => {
        // Capture default lighting on mount
        defaultLighting.current = {
            Ambient: Lighting.Ambient,
            OutdoorAmbient: Lighting.OutdoorAmbient,
            EnvironmentDiffuseScale: Lighting.EnvironmentDiffuseScale,
            EnvironmentSpecularScale: Lighting.EnvironmentSpecularScale,
            FogEnd: Lighting.FogEnd,
            FogStart: Lighting.FogStart,
            FogColor: Lighting.FogColor,
            Brightness: Lighting.Brightness,
        };

        // --- Helper: Find light in container ---
        function findLight(container: Instance): Light | undefined {
            const light = container.FindFirstChildOfClass("Light");
            if (light !== undefined) return light;
            return container.FindFirstChild("LightSource")?.FindFirstChildWhichIsA("Light");
        }

        // --- Helper: Get weather modifiers ---
        function getWeatherModifiers(weather: WeatherState): WeatherModifiers {
            switch (weather.type) {
                case WeatherType.Clear:
                    return {
                        brightnessMultiplier: 1.0,
                        lightBrightnessMultiplier: 1.0,
                    };
                case WeatherType.Cloudy:
                    return {
                        brightnessMultiplier: 0.75,
                        outdoorAmbientModifier: Color3.fromRGB(100, 100, 120),
                        fogEndOverride: 50000,
                        lightBrightnessMultiplier: 0.8,
                    };
                case WeatherType.Rainy:
                    return {
                        brightnessMultiplier: 0.5,
                        outdoorAmbientModifier: Color3.fromRGB(80, 80, 100),
                        fogEndOverride: 20000,
                        lightBrightnessMultiplier: 0.6,
                    };
                case WeatherType.Thunderstorm:
                    return {
                        brightnessMultiplier: 0.4,
                        outdoorAmbientModifier: Color3.fromRGB(60, 60, 80),
                        fogEndOverride: 15000,
                        lightBrightnessMultiplier: 0.6,
                    };
                default:
                    return {
                        brightnessMultiplier: 1.0,
                        lightBrightnessMultiplier: 1.0,
                    };
            }
        }

        // --- Helper: Apply layered lighting ---
        function applyLighting() {
            // Layer 1: Start with area config or defaults
            const baseConfig = currentAreaConfig.current ?? defaultLighting.current;

            // Layer 2: Apply weather modifiers
            const weatherMods = getWeatherModifiers(currentWeather.current);

            // Apply base config
            for (const [key, value] of pairs(baseConfig)) {
                (Lighting as unknown as { [key: string]: unknown })[key] = value;
            }

            // Apply weather modifications (multiplicative/additive)
            if (baseConfig.Brightness !== undefined) {
                Lighting.Brightness = baseConfig.Brightness * weatherMods.brightnessMultiplier;
            }

            if (weatherMods.outdoorAmbientModifier !== undefined) {
                Lighting.OutdoorAmbient = weatherMods.outdoorAmbientModifier;
            }

            if (weatherMods.fogEndOverride !== undefined) {
                Lighting.FogEnd = weatherMods.fogEndOverride;
            }

            // Update rain effect
            RainParallel.setWeatherState(currentWeather.current);
        }

        // --- Subscribe to area changes ---
        const areaConnection = Packets.currentArea.observe((areaId) => {
            currentAreaConfig.current = areaId !== undefined ? AREAS[areaId]?.lightingConfiguration : undefined;
            applyLighting();
        });
        cleanupFns.current.push(() => areaConnection.disconnect());

        // Initial area apply
        const initialAreaId = Packets.currentArea.get();
        currentAreaConfig.current =
            initialAreaId !== undefined ? AREAS[initialAreaId]?.lightingConfiguration : undefined;
        applyLighting();

        // --- Subscribe to weather changes ---
        const weatherConnection = Packets.weatherChanged.fromServer((weatherState: object) => {
            currentWeather.current = weatherState as WeatherState;
            applyLighting();
        });
        cleanupFns.current.push(() => weatherConnection.Disconnect());

        // Request initial weather state
        task.spawn(() => {
            const weatherState = Packets.getWeatherState.toServer() as WeatherState;
            currentWeather.current = weatherState;
            applyLighting();
        });

        // --- Set up cycling lights (WorldNode) ---
        const lightNode = new WorldNode(
            "CyclingLight",
            (container) => {
                const light = findLight(container);
                if (light !== undefined) cyclingLights.current.set(light, light.Brightness);
            },
            (container) => {
                const light = findLight(container);
                if (light !== undefined) cyclingLights.current.delete(light);
            },
        );
        cleanupFns.current.push(() => {
            // WorldNode cleanup if it has a destroy method
            if ("destroy" in lightNode && typeIs((lightNode as { destroy: unknown }).destroy, "function")) {
                (lightNode as { destroy: () => void }).destroy();
            }
        });

        // --- Variable interval for updating dynamic lights ---
        let oldQualityLevel = UserGameSettings!.SavedQualityLevel.Value;
        const updateLights = () => {
            const qualityLevel = UserGameSettings!.SavedQualityLevel.Value;
            const currentWeatherMods = getWeatherModifiers(currentWeather.current);

            for (const [light, base] of cyclingLights.current) {
                // Update shadows based on quality
                if (oldQualityLevel !== qualityLevel) {
                    light.Shadows = qualityLevel === 10;
                }

                // Calculate base brightness from time of day
                let brightness = qualityLevel === 1 ? 0 : (math.abs(Lighting.ClockTime - 12) / 8 - 0.25) * base * 2;

                // Apply weather dimming (multiplicative)
                brightness *= currentWeatherMods.lightBrightnessMultiplier;

                light.Brightness = brightness;
            }
            oldQualityLevel = qualityLevel;
        };

        const options = { interval: 1 };
        const cleanup = variableInterval(() => {
            updateLights();
            const qualityLevel = UserGameSettings!.SavedQualityLevel.Value;
            options.interval = qualityLevel >= 5 ? 1 / 60 : 1;
        }, options);
        cleanupFns.current.push(cleanup);

        // --- Cleanup on unmount ---
        return () => {
            // Run all cleanup functions
            cleanupFns.current.forEach((fn) => fn());

            // Restore default lighting
            for (const [key, value] of pairs(defaultLighting.current)) {
                (Lighting as unknown as { [key: string]: unknown })[key] = value;
            }

            // Clear cycling lights
            cyclingLights.current.clear();
        };
    }, []);

    return <Fragment />;
}
