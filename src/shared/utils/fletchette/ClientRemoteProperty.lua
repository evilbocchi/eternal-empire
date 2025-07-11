--!native

local Signal = require(script.Parent.Signal)
local ClientRemoteSignal = require(script.Parent.ClientRemoteSignal)

local ClientRemoteProperty = {}
ClientRemoteProperty.__index = ClientRemoteProperty

function ClientRemoteProperty.new(re: RemoteEvent)
	local self = setmetatable({}, ClientRemoteProperty)
	self._rs = ClientRemoteSignal.new(re)
	self._ready = false
	self._value = nil
	self.changed = Signal.new()
	self._rs:fire()

	self._changed = self._rs:connect(function(value)
		local changed = value ~= self._value
		self._value = value
		if not self._ready then
			self._ready = true
		end
		if changed then
			self.changed:fire(value)
		end
	end)

	return self
end

function ClientRemoteProperty:get(): any
	return self._value
end

function ClientRemoteProperty:isReady(): boolean
	return self._ready
end

function ClientRemoteProperty:observe(observer: (any) -> ())
	if self._ready then
		task.defer(observer, self._value)
	end
	return self.changed:connect(observer)
end

function ClientRemoteProperty:destroy()
	self._rs:destroy()
	if self._changed then
		self._changed:Disconnect()
	end
	self.changed:destroy()
end

return ClientRemoteProperty