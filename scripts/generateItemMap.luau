local fs = require("@lune/fs")

-- Find all items in src/shared/items
local itemsDir = "out/shared/items"
local itemFilePaths = {}
-- Recursively find all .ts files in the items directory
function findItemFiles(dir: string)
    local files = fs.readDir(dir)
    for _, name in ipairs(files) do
        local path = `{dir}/{name}`
        if (name == "Items.luau" or name == "ItemUtils.luau") then
            continue
        end

        if (fs.isDir(path)) then
            findItemFiles(path)
        elseif (fs.isFile(path)) then
            itemFilePaths[path] = true
        end
    end
end
findItemFiles(itemsDir)

for path, _ in pairs(itemFilePaths) do
    local item = require("../" .. path)
    print(item)
end