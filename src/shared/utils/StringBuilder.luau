--!native
--!optimize 2
local StringBuilder = {}
StringBuilder.__index = StringBuilder

function StringBuilder.append(self: StringBuilder, str: any)
    self[#self+1] = tostring(str)
    return self
end

function StringBuilder.appendAll(self: StringBuilder, ...: any)
    local len = #self
    for i=1,select("#",...) do
        self[len+i] = tostring((select(i,...)))
    end
    return self
end

function StringBuilder.pop(self: StringBuilder, amt: number)
    amt = amt or 1
    local len = #self
    for i=len,len-amt+1,-1 do
        self[i] = nil
    end
    return self
end

function StringBuilder.toString(self: StringBuilder)
    return table.concat(self)
end

function StringBuilder.__tostring(self: StringBuilder)
    return table.concat(self)
end

function StringBuilder.__call(self: StringBuilder, _ ,key)
    key = key and key+1 or 1
    local value = self[key]
    if value ~= nil then
        return key,value
    end
end

function StringBuilder.new(...: any)
    return setmetatable({...}, StringBuilder)
end

type StringBuilder = typeof (setmetatable({}, StringBuilder))

return StringBuilder