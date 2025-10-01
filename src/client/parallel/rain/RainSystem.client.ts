import { Debris, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import RainParallel from "client/parallel/rain/RainParallel";
import { getAsset } from "shared/asset/AssetMap";
import { CAMERA } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
import { WeatherState, WeatherType } from "shared/weather/WeatherTypes";

// Client Variables
const debris = Workspace.WaitForChild("Terrain") as Terrain;
const { rainHit, rainPuddle, rainSplash, rainTrail } = (() => {
    const rainHit = new Instance("ParticleEmitter");
    rainHit.Color = new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(228, 240, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(228, 240, 255)),
    ]);
    rainHit.EmissionDirection = Enum.NormalId.Front;
    rainHit.Enabled = false;
    rainHit.FlipbookLayout = Enum.ParticleFlipbookLayout.Grid4x4;
    rainHit.FlipbookMode = Enum.ParticleFlipbookMode.OneShot;
    rainHit.Lifetime = new NumberRange(0.3, 0.3);
    rainHit.LightInfluence = 0.5;
    rainHit.Name = "Hit";
    rainHit.Rate = 2;
    rainHit.Rotation = new NumberRange(-180, 180);
    rainHit.Size = new NumberSequence([
        new NumberSequenceKeypoint(0, 0, 0),
        new NumberSequenceKeypoint(0.016, 0.8, 0),
        new NumberSequenceKeypoint(1, 1, 0),
    ]);
    rainHit.Speed = new NumberRange(0.001, 0.001);
    rainHit.SpreadAngle = new Vector2(0.1, 0.1);
    rainHit.Texture = "rbxassetid://125957387729715";
    rainHit.Transparency = new NumberSequence([
        new NumberSequenceKeypoint(0, 1, 0),
        new NumberSequenceKeypoint(0.093, 0.9, 0),
        new NumberSequenceKeypoint(0.319, 0.95, 0),
        new NumberSequenceKeypoint(1, 1, 0),
    ]);

    const rainPuddle = new Instance("ParticleEmitter");
    rainPuddle.Color = new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(228, 240, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(228, 240, 255)),
    ]);
    rainPuddle.EmissionDirection = Enum.NormalId.Front;
    rainPuddle.Enabled = false;
    rainPuddle.FlipbookMode = Enum.ParticleFlipbookMode.OneShot;
    rainPuddle.Lifetime = new NumberRange(1.5, 1.5);
    rainPuddle.LightInfluence = 0.5;
    rainPuddle.Name = "Puddle";
    rainPuddle.Orientation = Enum.ParticleOrientation.VelocityPerpendicular;
    rainPuddle.Rate = 0.5;
    rainPuddle.Rotation = new NumberRange(-180, 180);
    rainPuddle.ShapeStyle = Enum.ParticleEmitterShapeStyle.Surface;
    rainPuddle.Size = new NumberSequence([
        new NumberSequenceKeypoint(0, 4.31, 0.5),
        new NumberSequenceKeypoint(1, 4.5, 0.5),
    ]);
    rainPuddle.Speed = new NumberRange(0.001, 0.001);
    rainPuddle.SpreadAngle = new Vector2(0.1, 0.1);
    rainPuddle.Texture = "rbxassetid://12302665387";
    rainPuddle.Transparency = new NumberSequence([
        new NumberSequenceKeypoint(0, 1, 0),
        new NumberSequenceKeypoint(0.215, 0.85, 0),
        new NumberSequenceKeypoint(1, 1, 0),
    ]);

    const rainSplash = new Instance("ParticleEmitter");
    rainSplash.Color = new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(228, 240, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(228, 240, 255)),
    ]);
    rainSplash.EmissionDirection = Enum.NormalId.Front;
    rainSplash.Enabled = false;
    rainSplash.Lifetime = new NumberRange(0.3, 0.3);
    rainSplash.LightInfluence = 0.5;
    rainSplash.Name = "Splash";
    rainSplash.Orientation = Enum.ParticleOrientation.VelocityPerpendicular;
    rainSplash.Rate = 1;
    rainSplash.Size = new NumberSequence([
        new NumberSequenceKeypoint(0, 0.5, 0),
        new NumberSequenceKeypoint(1, 1.062, 0),
    ]);
    rainSplash.Speed = new NumberRange(0.001, 0.001);
    rainSplash.SpreadAngle = new Vector2(0.1, 0.1);
    rainSplash.Texture = "rbxassetid://16587390596";
    rainSplash.Transparency = new NumberSequence([
        new NumberSequenceKeypoint(0, 0.719, 0),
        new NumberSequenceKeypoint(1, 1, 0),
    ]);

    const rainTrail = new Instance("ParticleEmitter");
    rainTrail.Color = new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(229, 235, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(175, 186, 204)),
    ]);
    rainTrail.EmissionDirection = Enum.NormalId.Front;
    rainTrail.Enabled = false;
    rainTrail.Lifetime = new NumberRange(0.3, 0.3);
    rainTrail.LightInfluence = 0.5;
    rainTrail.Name = "Trail";
    rainTrail.Orientation = Enum.ParticleOrientation.FacingCameraWorldUp;
    rainTrail.Rate = 1;
    rainTrail.Rotation = new NumberRange(-1, 1);
    rainTrail.Size = new NumberSequence([new NumberSequenceKeypoint(0, 2, 0), new NumberSequenceKeypoint(1, 2, 0)]);
    rainTrail.Speed = new NumberRange(350, 350);
    rainTrail.Texture = "http://www.roblox.com/asset/?id=3806148993";
    rainTrail.Transparency = new NumberSequence([
        new NumberSequenceKeypoint(0, 1, 0),
        new NumberSequenceKeypoint(0.015, 0.6, 0),
        new NumberSequenceKeypoint(1, 0.444, 0),
    ]);

    return { rainHit, rainPuddle, rainSplash, rainTrail };
})();

// Script Settings
const basePuddleAmount = 3;
const baseStartHeight = 35;
const baseRainAmount = 15;
const range = 50;

// Weather state
let currentWeather: WeatherState = { type: WeatherType.Clear, intensity: 0, duration: 300, timeRemaining: 300 };
let rainEnabled = false;

// Dynamic settings based on weather
function getCurrentSettings() {
    const intensityMultiplier = rainEnabled ? currentWeather.intensity : 0;
    return {
        puddleAmount: basePuddleAmount * intensityMultiplier,
        startHeight: baseStartHeight,
        rainAmount: baseRainAmount * intensityMultiplier,
    };
}

// Weather Sound Effects
const { rainSFX, rainIndoorEq, rainIndoorReverb } = (() => {
    const Rain = new Instance("Sound");
    Rain.Looped = true;
    Rain.Name = "Rain";
    Rain.Playing = true;
    Rain.SoundId = getAsset("assets/sounds/Rain.mp3");
    Rain.TimePosition = 53;
    Rain.Parent = IS_EDIT ? Environment.PluginWidget : ReplicatedStorage;
    eat(Rain, "Destroy");

    const IndoorReverb = new Instance("ReverbSoundEffect");
    IndoorReverb.DecayTime = 0.5;
    IndoorReverb.DryLevel = 6;
    IndoorReverb.Name = "IndoorReverb";
    IndoorReverb.WetLevel = 0.1;
    IndoorReverb.Parent = Rain;

    const IndoorEq = new Instance("EqualizerSoundEffect");
    IndoorEq.HighGain = -18;
    IndoorEq.LowGain = 0;
    IndoorEq.MidGain = 0;
    IndoorEq.Name = "IndoorEq";
    IndoorEq.Parent = Rain;

    return { rainSFX: Rain, rainIndoorEq: IndoorEq, rainIndoorReverb: IndoorReverb };
})();

// Defined
const random = math.random;
const floor = math.floor;
const clamp = math.clamp;

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// Max Lifetimes
const puddleMaxTime = rainPuddle.Lifetime.Max;
const rainMaxTime = rainSplash.Lifetime.Max;

// Raycast Params
const raycastParams = new RaycastParams();
raycastParams.IgnoreWater = true;
raycastParams.RespectCanCollide = true;
raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
raycastParams.FilterDescendantsInstances = [];

function getRaycastDirections() {
    const settings = getCurrentSettings();
    return {
        rainRaycastDirection: new Vector3(0, -settings.startHeight * 1.8, 0),
        buildingRaycastDirection: new Vector3(0, settings.startHeight, 0),
    };
}

// Functions
function castRain(): RaycastResult | undefined {
    const settings = getCurrentSettings();
    const directions = getRaycastDirections();
    // Raycasting Our Raindrops & Puddles
    return Workspace.Raycast(
        CAMERA.CFrame.Position.add(new Vector3(random(-range, range), settings.startHeight, random(-range, range))),
        directions.rainRaycastDirection,
        raycastParams,
    );
}

function scaleAmount(base: number, deltaTime: number): number {
    // Lock Casting To # Per Frame From 60FPS
    return floor(base * clamp(deltaTime * 60, 0.5, 1.5));
}

function inBuilding(): boolean {
    const directions = getRaycastDirections();
    // Raycasting To See If The Player Is Inside Of A Building Or Not
    const result = Workspace.Raycast(CAMERA.CFrame.Position, directions.buildingRaycastDirection, raycastParams);
    return result !== undefined;
}

// Rain Data
interface RainHitData {
    RainHitCFrame: CFrame;
}

const rainHits: RainHitData[] = [];
const puddleHits: RainHitData[] = [];

// Misc Variables
let insideOfBuilding = false;
const soundEffects: Record<string, number> = {};

// Weather integration
RainParallel.bindRainEnabled((newEnabled: boolean) => {
    // Update sound playing state
    rainSFX.Playing = newEnabled;
    rainSFX.Volume = newEnabled ? currentWeather.intensity * 0.5 : 0;
    rainEnabled = newEnabled;
});

// Parallel RunService
RunService.RenderStepped.ConnectParallel((deltaTime) => {
    if (!rainEnabled) return; // Skip rain logic when not raining

    const settings = getCurrentSettings();

    // Raycast Raindrops
    for (let i = 0; i < scaleAmount(settings.rainAmount, deltaTime); i++) {
        const raycast = castRain();
        if (raycast) {
            rainHits.push({
                RainHitCFrame: new CFrame(raycast.Position, raycast.Position.add(raycast.Normal)).mul(
                    new CFrame(0, 0, -0.2),
                ),
            });
        }
    }

    // Raycast Puddles
    for (let i = 0; i < scaleAmount(settings.puddleAmount, deltaTime); i++) {
        const raycast = castRain();
        if (raycast) {
            puddleHits.push({
                RainHitCFrame: new CFrame(raycast.Position, raycast.Position.add(raycast.Normal)).mul(
                    new CFrame(0, 0, -0.2),
                ),
            });
        }
    }

    // Check If We Are Inside Of A Building
    insideOfBuilding = inBuilding();

    // Sound Effects Lerp
    if (insideOfBuilding) {
        soundEffects.HighGain = lerp(rainIndoorEq.HighGain, -18, 3 * deltaTime);
        soundEffects.DecayTime = lerp(rainIndoorReverb.DecayTime, 0.5, 3 * deltaTime);
        soundEffects.Density = lerp(rainIndoorReverb.Density, 1, 3 * deltaTime);
        soundEffects.Diffusion = lerp(rainIndoorReverb.Diffusion, 1, 3 * deltaTime);
        soundEffects.DryLevel = lerp(rainIndoorReverb.DryLevel, 6, 3 * deltaTime);
        soundEffects.WetLevel = lerp(rainIndoorReverb.WetLevel, 0.1, 3 * deltaTime);
    } else {
        soundEffects.HighGain = lerp(rainIndoorEq.HighGain, 0, 3 * deltaTime);
        soundEffects.DecayTime = lerp(rainIndoorReverb.DecayTime, 0, 3 * deltaTime);
        soundEffects.Density = lerp(rainIndoorReverb.Density, 0, 3 * deltaTime);
        soundEffects.Diffusion = lerp(rainIndoorReverb.Diffusion, 0, 3 * deltaTime);
        soundEffects.DryLevel = lerp(rainIndoorReverb.DryLevel, 0, 3 * deltaTime);
        soundEffects.WetLevel = lerp(rainIndoorReverb.WetLevel, 0, 3 * deltaTime);
    }
});

// Serial RunService
RunService.RenderStepped.Connect(() => {
    if (!rainEnabled) {
        // Clear any remaining rain effects when rain is disabled
        rainHits.clear();
        puddleHits.clear();
        return;
    }

    // Spawn RainDrops
    for (let i = rainHits.size() - 1; i >= 0; i--) {
        // Get And Remove Data
        const hitData = rainHits.remove(i)!;

        // Create Attachment
        const attachment = new Instance("Attachment");
        attachment.WorldCFrame = hitData.RainHitCFrame;
        attachment.Parent = debris;

        // Particle Variables
        const hit = rainHit.Clone();
        hit.Parent = attachment;
        const splash = rainSplash.Clone();
        splash.Parent = attachment;
        const trail = rainTrail.Clone();
        trail.Parent = attachment;

        // Emit Particles
        hit.Emit(1);
        splash.Emit(1);
        trail.Emit(1);

        // Remove Attachment
        Debris.AddItem(attachment, rainMaxTime);
    }

    // Spawn Puddles
    for (let i = puddleHits.size() - 1; i >= 0; i--) {
        // Get And Remove Data
        const hitData = puddleHits.remove(i)!;

        // Create Attachment
        const attachment = new Instance("Attachment");
        attachment.WorldCFrame = hitData.RainHitCFrame;
        attachment.Parent = debris;

        // Particle Variables
        const puddle = rainPuddle.Clone();
        puddle.Parent = attachment;

        // Emit Particles
        puddle.Emit(1);

        // Remove Attachment
        Debris.AddItem(attachment, puddleMaxTime);
    }

    // Sound Effects (only when rain is enabled)
    if (soundEffects["HighGain"] !== undefined) {
        rainIndoorEq.HighGain = soundEffects.HighGain;
        rainIndoorReverb.DecayTime = soundEffects.DecayTime;
        rainIndoorReverb.Density = soundEffects.Density;
        rainIndoorReverb.Diffusion = soundEffects.Diffusion;
        rainIndoorReverb.DryLevel = soundEffects.DryLevel;
        rainIndoorReverb.WetLevel = soundEffects.WetLevel;

        if (soundEffects.DecayTime < 0.11) {
            rainIndoorReverb.Enabled = false;
        } else {
            rainIndoorReverb.Enabled = true;
        }
    }
});
