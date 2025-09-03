import fs from "fs";
import path from "path";

const npcsDir = path.resolve("./src/shared/npcs");
const outputFile = path.resolve("./src/shared/npcs/npc-names.d.ts");

const files = fs
    .readdirSync(npcsDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => path.basename(f, ".ts"));

const typeDef = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run \`node scripts/generateNpcNames.js\` to update.

declare global {
  type NPCName = ${files.map((f) => `"${f}"`).join(" | ")};
}

export {};
`;

fs.writeFileSync(outputFile, typeDef, "utf8");
