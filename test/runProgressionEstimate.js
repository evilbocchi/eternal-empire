import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import publish from "../sandbox/publish.js";
import { runCloudLuau } from "./cloudLuauRunner.js";
import { buildModulePathLookup, createLuauPathTransformer, createModulePathResolver } from "./luauPathUtils.js";

dotenv.config({ quiet: true });

const robloxLogs = [];

function log(message, level = "info") {
    const entry = { message: String(message), level };

    if (level === "log") {
        robloxLogs.push(entry);
    }
}

const repoRoot = path.join(import.meta.dirname, "..");
const outputPath = path.join(repoRoot, "PROGRESS_ESTIMATION.md");
const modulePathLookup = buildModulePathLookup(repoRoot);
const resolveModulePath = createModulePathResolver(modulePathLookup);
const transformLuauPath = createLuauPathTransformer(resolveModulePath);
const scriptPath = path.join(import.meta.dirname, "scripts", "estimateProgress.luau");

function writeReport({ state, detail }) {
    const statusLabels = {
        success: "Success",
        failure: "Failure",
        skipped: "Skipped",
        error: "Error",
    };

    const timestamp = new Date().toISOString();
    const lines = [
        "# Progress Estimation Report",
        "",
        `- Generated: ${timestamp}`,
        `- Result: ${statusLabels[state] ?? "Unknown"}`,
    ];

    if (detail) {
        lines.push(`- Detail: ${detail}`);
    }

    lines.push("");

    const relevantLogs = robloxLogs;

    if (relevantLogs.length === 0) {
        lines.push("No Roblox log entries captured.");
    } else {
        for (const entry of relevantLogs) {
            lines.push(entry.message);
        }
    }

    fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
}

async function main() {
    const originalStdoutWrite =
        typeof process?.stdout?.write === "function" ? process.stdout.write.bind(process.stdout) : null;

    let result;

    try {
        if (originalStdoutWrite) {
            process.stdout.write = () => true;
        }

        const PLACE_VERSION = await publish();

        result = await runCloudLuau(scriptPath, {
            placeVersion: PLACE_VERSION,
            log,
            transform: transformLuauPath,
        });
    } finally {
        if (originalStdoutWrite) {
            process.stdout.write = originalStdoutWrite;
        }
    }

    if (result === true) {
        writeReport({ state: "success", detail: "Luau task completed successfully." });
        process.exit(0);
    }

    if (result === false) {
        writeReport({ state: "failure", detail: "Luau task reported failure." });
        process.exit(1);
    }

    log("Cloud execution skipped (missing configuration).", "warn");
    writeReport({ state: "skipped", detail: "Cloud execution skipped (missing configuration)." });
    process.exit(0);
}

main().catch((error) => {
    console.log(`Progression estimation runner encountered an error: ${error?.message ?? String(error)}`);
    try {
        writeReport({ state: "error", detail: error?.message ?? String(error) });
    } catch (writeError) {
        console.error("Failed to write PROGRESS_ESTIMATION.md:", writeError);
    }
    process.exit(1);
});
