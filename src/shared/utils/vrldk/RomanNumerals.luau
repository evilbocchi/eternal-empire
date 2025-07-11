local numbers = { 1, 5, 10, 50, 100, 500, 1000 }
local chars = { "I", "V", "X", "L", "C", "D", "M" }

local RomanNumerals = { }

function RomanNumerals.ToRomanNumerals(s)
    --s = tostring(s)
    s = tonumber(s)
    if not s or s ~= s then error"Unable to convert to number" end
    if s == math.huge then error"Unable to convert infinity" end
    s = math.floor(s)
    if s <= 0 then return s end
	local ret = ""
        for i = #numbers, 1, -1 do
        local num = numbers[i]
        while s - num >= 0 and s > 0 do
            ret = ret .. chars[i]
            s = s - num
        end
        --for j = i - 1, 1, -1 do
        for j = 1, i - 1 do
            local n2 = numbers[j]
            if s - (num - n2) >= 0 and s < num and s > 0 and num - n2 ~= n2 then
                ret = ret .. chars[j] .. chars[i]
                s = s - (num - n2)
                break
            end
        end
    end
    return ret
end

return RomanNumerals