--!native

local Signal = require(script.Parent.Signal)

local ClientRemoteFunc = {}
ClientRemoteFunc.__index = ClientRemoteFunc

function ClientRemoteFunc.new(
	rf: RemoteFunction
)
	local self = setmetatable({}, ClientRemoteFunc)
	self._rf = rf
	return self
end

function ClientRemoteFunc:onInvoke(fn: (...any) -> ())
	self._rf.OnClientInvoke = fn
end

function ClientRemoteFunc:invoke(...: any)
	return self._rf:InvokeServer(...)
end

function ClientRemoteFunc:destroy()

end

return ClientRemoteFunc