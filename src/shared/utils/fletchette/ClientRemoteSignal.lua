--!native

-- ClientRemoteSignal
-- Stephen Leitnick
-- December 20, 2021

local Signal = require(script.Parent.Signal)

--[=[
	@class ClientRemoteSignal
	@client
	Created via `ClientComm:GetSignal()`.
]=]
local ClientRemoteSignal = {}
ClientRemoteSignal.__index = ClientRemoteSignal

--[=[
	@within ClientRemoteSignal
	@interface Connection
	.Disconnect () -> ()

	Represents a connection.
]=]

function ClientRemoteSignal.new(
	re: RemoteEvent | UnreliableRemoteEvent
)
	local self = setmetatable({}, ClientRemoteSignal)
	self._re = re
	return self
end

--[=[
	@param fn (...: any) -> ()
	@return Connection
	Connects a function to the remote signal. The function will be
	called anytime the equivalent server-side RemoteSignal is
	fired at this specific client that created this client signal.
]=]
function ClientRemoteSignal:connect(fn: (...any) -> ())
	return self._re.OnClientEvent:Connect(fn)
end

--[=[
	Fires the equivalent server-side signal with the given arguments.

	:::note Outbound Middleware
	All arguments pass through any outbound middleware before being
	sent to the server.
	:::
]=]
function ClientRemoteSignal:fire(...: any)
	self._re:FireServer(...)
end

--[=[
	Destroys the ClientRemoteSignal object.
]=]
function ClientRemoteSignal:destroy()

end

return ClientRemoteSignal