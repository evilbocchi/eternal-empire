// Clear registered modules to reset the roblox-ts runtime
for (const [key] of pairs(_G)) {
    if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
        _G[key as never] = undefined as never;
    }
}
