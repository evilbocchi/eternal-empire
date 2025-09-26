import Difficulty from "@antivivi/jjt-difficulties";

export default function getDifficultyDisplayColors(difficulty?: Difficulty): { background: Color3; text: Color3 } {
    const color = difficulty?.color ?? new Color3();

    const background = new Color3(
        math.clamp(color.R, 0.1, 0.9),
        math.clamp(color.G, 0.1, 0.9),
        math.clamp(color.B, 0.1, 0.9),
    );
    const text = color.Lerp(new Color3(1, 1, 1), 0.5) ?? new Color3(1, 1, 1);

    return { background, text };
}
