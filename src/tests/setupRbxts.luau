-- Upstream from https://github.com/littensy/charm-example/blob/main/test/setup.luau
for key in _G do
	-- Clear registered modules to reset the roblox-ts runtime
	if typeof(key) == "Instance" and key:IsA("ModuleScript") then
		_G[key] = nil
	end
end

return nil