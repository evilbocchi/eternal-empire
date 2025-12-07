import dotenv from "dotenv";
import * as rbxluau from "rbxluau";

// Load environment variables from .env file
dotenv.config({ quiet: true });

// Get test filter from environment variable (set by VS Code extension)
const testNamePattern = process.env.JEST_TEST_NAME_PATTERN || "";

let luauScript = `local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local target = ReplicatedStorage.shared.hamster.runTests
print("Running test script from:", target:GetFullName())
print("IsRunning:", RunService:IsRunning())
print("IsStudio:", RunService:IsStudio())
print("IsServer:", RunService:IsServer())
print("IsClient:", RunService:IsClient())
table.clear(_G)
return require(target)`;

if (testNamePattern) {
	// Escape the pattern for Lua string
	const escapedPattern = testNamePattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	luauScript += `("${escapedPattern}")`;
} else {
	luauScript += "()";
}

rbxluau.executeLuau(luauScript, {
	place: "sandbox/local.rbxl",
});
