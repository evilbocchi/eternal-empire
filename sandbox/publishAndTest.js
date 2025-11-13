import axios from "axios";
import { spawn } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import signale from "signale";
import { fileURLToPath } from "url";

const logger = new signale.Signale();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Environment variables
const API_KEY = process.env.LUAU_EXECUTION_KEY;
const UNIVERSE_ID = process.env.LUAU_EXECUTION_UNIVERSE_ID;
const PLACE_ID = process.env.LUAU_EXECUTION_PLACE_ID;

// File path
const PLACE_FILE_PATH = path.join(__dirname, "local.rbxl");

async function publish(production = false) {
    // Validate environment variables
    if (!API_KEY) {
        logger.error("Missing LUAU_EXECUTION_KEY in .env file");
        process.exit(1);
    }

    if (!UNIVERSE_ID) {
        logger.error("Missing LUAU_EXECUTION_UNIVERSE_ID in .env file");
        process.exit(1);
    }

    if (!PLACE_ID) {
        logger.error("Missing LUAU_EXECUTION_PLACE_ID in .env file");
        process.exit(1);
    }

    // Check if place file exists
    if (!fs.existsSync(PLACE_FILE_PATH)) {
        logger.error(`Place file not found: ${PLACE_FILE_PATH}`);
        logger.info("Run 'npm run build:place' to generate the place file first");
        process.exit(1);
    }

    const placeFileBuffer = fs.readFileSync(PLACE_FILE_PATH);
    const fileStats = fs.statSync(PLACE_FILE_PATH);
    logger.info(
        `Publishing place file ${PLACE_FILE_PATH} to universe=${UNIVERSE_ID}, place=${PLACE_ID}. File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`,
    );

    const response = await axios({
        method: "post",
        url: `https://apis.roblox.com/universes/v1/${UNIVERSE_ID}/places/${PLACE_ID}/versions?versionType=${production ? "Published" : "Saved"}`,
        data: placeFileBuffer,
        headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/octet-stream",
            "User-Agent": "Node.js/Roblox-Place-Publisher",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
    });

    logger.success(`Published to version ${response.data.versionNumber || "N/A"}`);
    return response.data.versionNumber;
}

function runTests(versionNumber) {
    return new Promise((resolve, reject) => {
        const testProcess = spawn("node", ["test/runTests.js", `--version=${versionNumber}`, "--mode=cloud"], {
            stdio: "inherit",
            shell: true,
        });

        testProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject();
            }
        });

        testProcess.on("error", reject);
    });
}

async function main() {
    try {
        // Publish the place and get the version number
        const versionNumber = await publish();

        if (!versionNumber) {
            logger.error("Failed to get version number from publish");
            process.exit(1);
        }

        // Run tests on the published version
        await runTests(versionNumber);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
