#!/usr/bin/env node

import express from "express";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import signale from "signale";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Use parsed options
const PORT = 28354;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.resolve(REPO_ROOT, "src/services.d.ts");
const PROGRESSION_OUTPUT = path.resolve(REPO_ROOT, "PROGRESS_ESTIMATION.md");

async function writeFileIfChanged(filePath, content) {
    const relativePath = path.relative(REPO_ROOT, filePath);

    try {
        const currentContent = await readFile(filePath, "utf8");
        if (currentContent === content) {
            return { message: `No changes detected in ${relativePath}`, changed: false };
        }
    } catch (error) {
        if (error?.code !== "ENOENT") {
            throw error;
        }
    }

    await writeFile(filePath, content);
    return { message: `Written to ${relativePath}`, changed: true };
}

function generateInterfaceDefinition(serviceName, node, depth = 0) {
    const indent = "    ".repeat(depth);
    const childrenEntries = [];

    for (const child of node.children || []) {
        const childName = JSON.stringify(child.name);
        const robloxType = child.className;

        if (child.children && child.children.length > 0) {
            // Generate a nested interface for this child
            const childInterfaceName = `${serviceName}_${child.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
            const childInterface = generateInterfaceDefinition(childInterfaceName, child, depth);
            childrenEntries.push(`${indent}    ${childName}: ${childInterfaceName};`);
            // Store child interface for later generation
            if (!generateInterfaceDefinition.childInterfaces) {
                generateInterfaceDefinition.childInterfaces = [];
            }
            generateInterfaceDefinition.childInterfaces.push({
                name: childInterfaceName,
                content: childInterface,
                baseType: robloxType,
            });
        } else {
            childrenEntries.push(`${indent}    ${childName}: ${robloxType};`);
        }
    }

    return childrenEntries.join("\n");
}

function generateTypeScriptContent(trees) {
    const serviceNames = [
        "Workspace",
        "Players",
        "Lighting",
        "MaterialService",
        "ReplicatedFirst",
        "ReplicatedStorage",
        "ServerScriptService",
        "ServerStorage",
        "StarterGui",
        "StarterPack",
        "StarterPlayer",
        "Teams",
        "SoundService",
        "TextChatService",
    ];

    // Reset child interfaces for each generation
    generateInterfaceDefinition.childInterfaces = [];

    const interfaceDefinitions = [];

    for (let i = 0; i < trees.length && i < serviceNames.length; i++) {
        const tree = trees[i];
        const serviceName = serviceNames[i];

        if (tree && tree.children && tree.children.length > 0) {
            const childrenDef = generateInterfaceDefinition(serviceName, tree);

            if (childrenDef.trim()) {
                interfaceDefinitions.push(`interface ${serviceName} extends Instance {
${childrenDef}
}`);
            } else {
                interfaceDefinitions.push(`interface ${serviceName} extends Instance {}`);
            }
        } else {
            interfaceDefinitions.push(`interface ${serviceName} extends Instance {}`);
        }
    }

    // Add child interfaces
    for (const childInterface of generateInterfaceDefinition.childInterfaces || []) {
        if (childInterface.content.trim()) {
            interfaceDefinitions.push(`interface ${childInterface.name} extends ${childInterface.baseType} {
${childInterface.content}
}`);
        } else {
            interfaceDefinitions.push(`interface ${childInterface.name} extends ${childInterface.baseType} {}`);
        }
    }

    // Create a type that maps service names to their interfaces
    const serviceTypeEntries = serviceNames.map((name) => `    ${JSON.stringify(name)}: ${name};`);

    return `// AUTO-GENERATED FILE
// Do not edit manually.

// Roblox types must be available in your environment.

${interfaceDefinitions.join("\n\n")}

export type InstanceTreeType = {
${serviceTypeEntries.join("\n")}
};
`;
}

app.post("/write", async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object") {
        return res.status(400).send("Missing or invalid JSON body.");
    }

    const content = generateTypeScriptContent(body);
    try {
        const result = await writeFileIfChanged(OUTPUT, content);
        res.send(result.message);
    } catch (error) {
        signale.error(error);
        res.status(500).send(`Failed to write to ${path.relative(REPO_ROOT, OUTPUT)}.`);
    }
});

app.post("/progression-report", async (req, res) => {
    const body = typeof req.body === "object" && req.body !== null ? req.body : {};
    const { content, chunk, isFirst, isLast } = body;

    const relativePath = path.relative(REPO_ROOT, PROGRESSION_OUTPUT);

    if (typeof content === "string" && content.length > 0) {
        const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
        try {
            const result = await writeFileIfChanged(PROGRESSION_OUTPUT, normalizedContent);
            return res.send(result.message);
        } catch (error) {
            signale.error(error);
            return res.status(500).send(`Failed to write to ${relativePath}.`);
        }
    }

    if (typeof chunk === "string" && chunk.length > 0) {
        try {
            if (isFirst) {
                await writeFile(PROGRESSION_OUTPUT, chunk);
            } else {
                await appendFile(PROGRESSION_OUTPUT, chunk);
            }

            if (isLast && !chunk.endsWith("\n")) {
                await appendFile(PROGRESSION_OUTPUT, "\n");
            }

            return res.send(`Chunk received for ${relativePath}`);
        } catch (error) {
            signale.error(error);
            return res.status(500).send(`Failed to write chunk to ${relativePath}.`);
        }
    }

    return res.status(400).send("Missing progression report content.");
});

app.listen(PORT, () => {
    signale.info(`Plugin server running at http://localhost:${PORT}`);
});
