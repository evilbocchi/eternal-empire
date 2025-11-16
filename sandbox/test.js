import { spawn } from "child_process";
import dotenv from "dotenv";
import publish from "./publish.js";

dotenv.config({ quiet: true });

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

try {
    // Publish the place and get the version number
    const versionNumber = await publish();

    if (!versionNumber) {
        console.error("Failed to get version number from publish");
        process.exit(1);
    }

    // Run tests on the published version
    await runTests(versionNumber);

    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}
