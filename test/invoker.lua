local ServerScriptService = game:GetService("ServerScriptService")
local target = ServerScriptService:WaitForChild("TS"):WaitForChild("tests"):WaitForChild("runTests")
print("Running test script from:", target:GetFullName())
require(target)