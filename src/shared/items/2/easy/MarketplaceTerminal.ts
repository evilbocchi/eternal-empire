import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Marketplace Terminal")
    .setDescription(
        "A high-tech terminal that provides access to the marketplace. Stand within 15 studs to automatically open the trading interface.",
    )
    .setDifficulty(Difficulty.Easy)
    .setPrice(new CurrencyBundle().set("Funds", 1000), 1)
    .addPlaceableArea("IntermittentIsles")
    .persists()

    .onClientLoad((model) => {
        // Add visual effects on client side
        const primaryPart = model.PrimaryPart;
        if (!primaryPart) return;

        // Create a subtle glow effect
        const pointLight = new Instance("PointLight");
        pointLight.Color = Color3.fromRGB(0, 150, 255);
        pointLight.Brightness = 0.5;
        pointLight.Range = 10;
        pointLight.Parent = primaryPart;

        // Add particle effect
        const attachment = new Instance("Attachment");
        attachment.Parent = primaryPart;

        const particles = new Instance("ParticleEmitter");
        particles.Color = new ColorSequence(Color3.fromRGB(0, 150, 255));
        particles.Size = new NumberSequence(0.2);
        particles.Lifetime = new NumberRange(1, 2);
        particles.Rate = 5;
        particles.SpreadAngle = new Vector2(45, 45);
        particles.Speed = new NumberRange(2, 4);
        particles.Parent = attachment;
    });
