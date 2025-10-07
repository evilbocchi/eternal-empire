--!nocheck
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local target = ReplicatedStorage:WaitForChild("TS"):WaitForChild("hamster"):WaitForChild("runTests")
print("Running test script from:", target:GetFullName())
require(target)()