/// <reference types="@rbxts/testez/globals" />
import { Janitor } from "@rbxts/janitor";
import { Server } from "shared/api/APIExpose";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import { WeatherType } from "shared/weather/WeatherTypes";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("AtmosphereService", () => {
        describe("getWeatherMultipliers", () => {
            it("returns correct multipliers for clear weather", () => {
                // Mock clear weather by setting private property using type assertion
                Server.Atmosphere.currentWeather = {
                    type: WeatherType.Clear,
                    intensity: 0,
                    duration: 300,
                    timeRemaining: 300,
                };

                const multipliers = Server.Atmosphere.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(1);
                expect(multipliers.dropletValue).to.equal(1);
            });

            it("returns correct multipliers for cloudy weather", () => {
                Server.Atmosphere.currentWeather = {
                    type: WeatherType.Cloudy,
                    intensity: 0.6,
                    duration: 300,
                    timeRemaining: 300,
                };

                const multipliers = Server.Atmosphere.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(0.75);
                expect(multipliers.dropletValue).to.equal(1);
            });

            it("returns correct multipliers for rainy weather", () => {
                Server.Atmosphere.currentWeather = {
                    type: WeatherType.Rainy,
                    intensity: 0.8,
                    duration: 240,
                    timeRemaining: 240,
                };

                const multipliers = Server.Atmosphere.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(0.5);
                expect(multipliers.dropletValue).to.equal(2.5);
            });

            it("returns correct multipliers for thunderstorm weather", () => {
                Server.Atmosphere.currentWeather = {
                    type: WeatherType.Thunderstorm,
                    intensity: 1,
                    duration: 180,
                    timeRemaining: 180,
                };

                const multipliers = Server.Atmosphere.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(0.5);
                expect(multipliers.dropletValue).to.equal(2.5);
            });
        });

        describe("getCurrentWeather", () => {
            it("returns the current weather state", () => {
                const weather = Server.Atmosphere.getCurrentWeather();
                expect(weather).to.be.a("table");
                expect(weather.type).to.be.a("string");
                expect(weather.intensity).to.be.a("number");
                expect(weather.duration).to.be.a("number");
                expect(weather.timeRemaining).to.be.a("number");
            });
        });

        describe("manual overrides", () => {
            it("supports manually setting weather with custom values", () => {
                Server.Atmosphere.setWeatherCustom(WeatherType.Rainy, 0.42, 123);
                const weather = Server.Atmosphere.getCurrentWeather();

                expect(weather.type).to.equal(WeatherType.Rainy);
                expect(weather.intensity).to.equal(0.42);
                expect(weather.duration).to.equal(123);
                const state = Server.Atmosphere as unknown as { isManuallyControlled: boolean };
                expect(state.isManuallyControlled).to.equal(true);
            });

            it("clears to sunny weather when requested", () => {
                Server.Atmosphere.clearWeather();
                const weather = Server.Atmosphere.getCurrentWeather();

                expect(weather.type).to.equal(WeatherType.Clear);
                expect(weather.intensity).to.equal(0);
            });

            it("resumes automatic weather generation", () => {
                Server.Atmosphere.setWeatherManual(WeatherType.Thunderstorm);
                const state = Server.Atmosphere as unknown as { isManuallyControlled: boolean };
                expect(state.isManuallyControlled).to.equal(true);

                Server.Atmosphere.resumeAutomaticWeather();
                expect(state.isManuallyControlled).to.equal(false);
            });
        });
    });
};
