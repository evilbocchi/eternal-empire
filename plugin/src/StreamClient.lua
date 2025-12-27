local HttpService = game:GetService("HttpService")
local log = require(script.Parent.log)

local StreamClient = {}
StreamClient.__index = StreamClient

function StreamClient.new(options)
	local self = setmetatable({}, StreamClient)
	self.url = assert(options.url, "url is required")
	self.method = options.method or "GET"
	self.headers = options.headers
	self.reconnectDelay = options.reconnectDelay or 5
	self.onOpened = options.onOpened
	self.onMessage = options.onMessage
	self.onClosed = options.onClosed
	self.onError = options.onError
	self.log = options.log or log
	self.client = nil
	self.connections = {}
	self.disposed = false
	return self
end

function StreamClient:isConnected()
	return self.client ~= nil
end

function StreamClient:disconnectSignals()
	for _, connection in ipairs(self.connections) do
		if connection and connection.Disconnect then
			connection:Disconnect()
		end
	end
	table.clear(self.connections)
end

function StreamClient:close()
	if not self.client then
		return
	end

	self:disconnectSignals()

	local success, result = pcall(function()
		if typeof(self.client.Close) == "function" then
			self.client:Close()
		elseif typeof(self.client.close) == "function" then
			self.client:close()
		end
	end)

	if not success then
		self.log(string.format("Failed to close stream client: %s", tostring(result)))
	end

	self.client = nil
end

function StreamClient:scheduleReconnect()
	if self.disposed or self.reconnectDelay <= 0 then
		return
	end

	task.delay(self.reconnectDelay, function()
		if self.disposed or self.client then
			return
		end
		self:connect()
	end)
end

function StreamClient:connect()
	if self.disposed or self.client then
		return
	end

	local success, clientOrError = pcall(function()
		return HttpService:CreateWebStreamClient(Enum.WebStreamClientType.RawStream, {
			Url = self.url,
			Method = self.method,
			Headers = self.headers,
		})
	end)

	if not success then
		self.log(string.format("Failed to create WebStream client: %s", tostring(clientOrError)))
		self:scheduleReconnect()
		return
	end

	self:disconnectSignals()
	self.client = clientOrError

	local function add(signal, handler)
		local ok, connection = pcall(function()
			return signal:Connect(handler)
		end)

		if ok and connection then
			table.insert(self.connections, connection)
		end
	end

	add(self.client.Opened, function(responseStatusCode)
		if self.onOpened then
			self.onOpened(responseStatusCode, self)
		end
	end)

	add(self.client.MessageReceived, function(message)
		if self.onMessage then
			self.onMessage(message, self)
		end
	end)

	add(self.client.Closed, function()
		if self.onClosed then
			self.onClosed(self)
		end
		self:close()
		self:scheduleReconnect()
	end)

	add(self.client.Error, function(responseStatusCode, errorMessage)
		if self.onError then
			self.onError(responseStatusCode, errorMessage, self)
		else
			self.log(string.format("Stream error (%s): %s", tostring(responseStatusCode), tostring(errorMessage)))
		end
		self:close()
		self:scheduleReconnect()
	end)
end

function StreamClient:send(payload)
	if not self.client then
		return false, "not connected"
	end

	local ok, err = pcall(function()
		self.client:Send(payload)
	end)

	if not ok then
		self.log(string.format("Failed to send payload: %s", tostring(err)))
	end

	return ok, err
end

function StreamClient:dispose()
	self.disposed = true
	self:close()
end

return StreamClient
