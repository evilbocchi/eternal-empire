import { afterEach, describe, expect, it } from "@rbxts/jest-globals";
import { Server } from "shared/api/APIExpose";
import { WeatherState, WeatherType } from "shared/weather/WeatherTypes";

describe("AtmosphereService", () => {
    const setWeatherAndRecalculate = (weather: WeatherState) => {
        Server.Atmosphere.currentWeather = weather;
        Server.Atmosphere.applyWeatherEffects();
    };

    afterEach(() => {
        setWeatherAndRecalculate({
            type: WeatherType.Clear,
            intensity: 0,
            duration: 300,
            timeRemaining: 300,
        });
    });

    describe("getWeatherMultipliers", () => {
        it("returns correct multipliers for clear weather", () => {
            setWeatherAndRecalculate({
                type: WeatherType.Clear,
                intensity: 0,
                duration: 300,
                timeRemaining: 300,
            });

            const multipliers = Server.Atmosphere.currentMultipliers;
            expect(multipliers.dropRate).toBe(1);
            expect(multipliers.dropletValue).toBe(1);
        });

        it("returns correct multipliers for cloudy weather", () => {
            setWeatherAndRecalculate({
                type: WeatherType.Cloudy,
                intensity: 0.6,
                duration: 300,
                timeRemaining: 300,
            });

            const multipliers = Server.Atmosphere.currentMultipliers;
            expect(multipliers.dropRate).toBe(0.75);
            expect(multipliers.dropletValue).toBe(1);
        });

        it("returns correct multipliers for rainy weather", () => {
            setWeatherAndRecalculate({
                type: WeatherType.Rainy,
                intensity: 0.8,
                duration: 240,
                timeRemaining: 240,
            });

            const multipliers = Server.Atmosphere.currentMultipliers;
            expect(multipliers.dropRate).toBe(0.5);
            expect(multipliers.dropletValue).toBe(2.5);
        });

        it("returns correct multipliers for thunderstorm weather", () => {
            setWeatherAndRecalculate({
                type: WeatherType.Thunderstorm,
                intensity: 1,
                duration: 180,
                timeRemaining: 180,
            });

            const multipliers = Server.Atmosphere.currentMultipliers;
            expect(multipliers.dropRate).toBe(0.5);
            expect(multipliers.dropletValue).toBe(2.5);
        });
    });

    describe("getCurrentWeather", () => {
        it("returns the current weather state", () => {
            const weather = Server.Atmosphere.getCurrentWeather();
            expect(weather).toEqual(expect.any("table"));
            expect(weather.type).toEqual(expect.any("string"));
            expect(weather.intensity).toEqual(expect.any("number"));
            expect(weather.duration).toEqual(expect.any("number"));
            expect(weather.timeRemaining).toEqual(expect.any("number"));
        });
    });

    describe("manual overrides", () => {
        it("supports manually setting weather with custom values", () => {
            Server.Atmosphere.setWeatherCustom(WeatherType.Rainy, 0.42, 123);
            const weather = Server.Atmosphere.getCurrentWeather();

            expect(weather.type).toBe(WeatherType.Rainy);
            expect(weather.intensity).toBe(0.42);
            expect(weather.duration).toBe(123);
            expect(Server.Atmosphere.isManuallyControlled).toBe(true);
        });

        it("clears to sunny weather when requested", () => {
            Server.Atmosphere.clearWeather();
            const weather = Server.Atmosphere.getCurrentWeather();

            expect(weather.type).toBe(WeatherType.Clear);
            expect(weather.intensity).toBe(0);
        });

        it("resumes automatic weather generation", () => {
            Server.Atmosphere.setWeatherManual(WeatherType.Thunderstorm);
            expect(Server.Atmosphere.isManuallyControlled).toBe(true);

            Server.Atmosphere.resumeAutomaticWeather();
            expect(Server.Atmosphere.isManuallyControlled).toBe(false);
        });
    });
});
