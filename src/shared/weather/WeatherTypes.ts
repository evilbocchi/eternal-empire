/**
 * Weather types that can occur in the game.
 */
export enum WeatherType {
    Clear = "Clear",
    Cloudy = "Cloudy",
    Rainy = "Rainy",
    Thunderstorm = "Thunderstorm",
}

/**
 * Current weather state information.
 */
export interface WeatherState {
    type: WeatherType;
    intensity: number; // 0-1 for effects intensity
    duration: number; // How long this weather lasts in seconds
    timeRemaining: number; // Time remaining for current weather
}
