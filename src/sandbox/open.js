import { execFile } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

function findRobloxStudioExe() {
    const platform = os.platform();
    if (platform === "win32") {
        const base = path.join(os.homedir(), "AppData", "Local", "Roblox", "Versions");
        if (!fs.existsSync(base)) return null;
        const versions = fs.readdirSync(base).filter((f) => {
            const exe = path.join(base, f, "RobloxStudioBeta.exe");
            return fs.existsSync(exe);
        });
        if (versions.length === 0) return null;
        versions.sort().reverse();
        return path.join(base, versions[0], "RobloxStudioBeta.exe");
    } else if (platform === "darwin") {
        const macPath = "/Applications/Roblox Studio.app/Contents/MacOS/RobloxStudio";
        if (fs.existsSync(macPath)) return macPath;
        return null;
    } else {
        return null;
    }
}

function openStudioWithPlace(placePath) {
    const exe = findRobloxStudioExe();
    if (!exe) {
        console.error("Could not find Roblox Studio executable.");
        process.exit(1);
    }
    // Launch Roblox Studio with the place file
    return execFile(exe, [placePath], (err) => {
        if (err) {
            console.error("Failed to launch Roblox Studio:", err);
            process.exit(1);
        }
        process.exit(0);
    });
}

function main() {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    // On Windows, pathname may start with a slash (e.g. /C:/...), so remove it if present
    const normalizedDir = process.platform === "win32" && __dirname.startsWith("/") ? __dirname.slice(1) : __dirname;
    const cwd = path.resolve(normalizedDir, "..", "..");

    const childProcess = openStudioWithPlace(path.resolve(cwd, "out", "sandbox.rbxl"));
    childProcess.on("exit", (code) => {
        if (code !== 0) {
            console.error(`Roblox Studio exited with code ${code}`);
            process.exit(code);
        }
        process.exit(0);
    });
}

main();
