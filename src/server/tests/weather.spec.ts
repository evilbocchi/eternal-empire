/// <reference types="@rbxts/testez/globals" />
import DataService from "server/services/data/DataService";
import AtmosphereService from "server/services/world/AtmosphereService";
import { WeatherType } from "shared/weather/WeatherTypes";

export = function () {
    describe("AtmosphereService", () => {
        const dataService = new DataService();
        const atmosphereService = new AtmosphereService(dataService);

        describe("getWeatherMultipliers", () => {
            it("returns correct multipliers for clear weather", () => {
                // Mock clear weather by setting private property using type assertion
                atmosphereService.currentWeather = {
                    type: WeatherType.Clear,
                    intensity: 0,
                    duration: 300,
                    timeRemaining: 300,
                };

                const multipliers = atmosphereService.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(1);
                expect(multipliers.dropletValue).to.equal(1);
            });

            it("returns correct multipliers for cloudy weather", () => {
                atmosphereService.currentWeather = {
                    type: WeatherType.Cloudy,
                    intensity: 0.6,
                    duration: 300,
                    timeRemaining: 300,
                };

                const multipliers = atmosphereService.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(0.75);
                expect(multipliers.dropletValue).to.equal(1);
            });

            it("returns correct multipliers for rainy weather", () => {
                atmosphereService.currentWeather = {
                    type: WeatherType.Rainy,
                    intensity: 0.8,
                    duration: 240,
                    timeRemaining: 240,
                };

                const multipliers = atmosphereService.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(0.5);
                expect(multipliers.dropletValue).to.equal(2.5);
            });

            it("returns correct multipliers for thunderstorm weather", () => {
                atmosphereService.currentWeather = {
                    type: WeatherType.Thunderstorm,
                    intensity: 1,
                    duration: 180,
                    timeRemaining: 180,
                };

                const multipliers = atmosphereService.getWeatherMultipliers();
                expect(multipliers.dropRate).to.equal(0.5);
                expect(multipliers.dropletValue).to.equal(2.5);
            });
        });

        describe("getCurrentWeather", () => {
            it("returns the current weather state", () => {
                const weather = atmosphereService.getCurrentWeather();
                expect(weather).to.be.a("table");
                expect(weather.type).to.be.a("string");
                expect(weather.intensity).to.be.a("number");
                expect(weather.duration).to.be.a("number");
                expect(weather.timeRemaining).to.be.a("number");
            });
        });
    });
};
