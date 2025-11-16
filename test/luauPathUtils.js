import fs from "fs";
import path from "path";

const MODULE_FILE_SUFFIXES = [".luau", ".lua"];

function defaultModuleRoots(repoRoot) {
    return [
        { moduleRoot: "ServerScriptService", dir: path.join(repoRoot, "out", "server") },
        { moduleRoot: "ReplicatedStorage.shared", dir: path.join(repoRoot, "out", "shared") },
        { moduleRoot: "ReplicatedStorage.client", dir: path.join(repoRoot, "out", "client") },
        { moduleRoot: "ReplicatedFirst", dir: path.join(repoRoot, "out", "sharedfirst") },
    ];
}

export function buildModulePathLookup(repoRoot, moduleRoots = defaultModuleRoots(repoRoot)) {
    const lookup = new Map();

    for (const { moduleRoot, dir } of moduleRoots) {
        if (!dir || !fs.existsSync(dir)) {
            continue;
        }

        const stack = [{ dir, segments: [] }];

        while (stack.length > 0) {
            const { dir: activeDir, segments } = stack.pop();
            let entries;

            try {
                entries = fs.readdirSync(activeDir, { withFileTypes: true });
            } catch {
                continue;
            }

            for (const entry of entries) {
                const entryPath = path.join(activeDir, entry.name);

                if (entry.isDirectory()) {
                    stack.push({ dir: entryPath, segments: [...segments, entry.name] });
                    continue;
                }

                if (!entry.isFile()) {
                    continue;
                }

                const suffix = MODULE_FILE_SUFFIXES.find((ext) => entry.name.endsWith(ext));
                if (!suffix) {
                    continue;
                }

                const baseName = entry.name.slice(0, -suffix.length);
                const moduleSegments = [...segments, baseName];
                const modulePath = [moduleRoot, ...moduleSegments.filter((segment) => segment.length > 0)].join(".");
                const relativePath = path.relative(repoRoot, entryPath).split(path.sep).join("/");

                lookup.set(modulePath, relativePath);

                if (baseName === "init" && segments.length > 0) {
                    const initModulePath = [moduleRoot, ...segments].join(".");
                    lookup.set(initModulePath, relativePath);
                }
            }
        }
    }

    return lookup;
}

export function createModulePathResolver(modulePathLookup) {
    return (modulePath) => {
        if (!modulePath || modulePathLookup.size === 0) {
            return null;
        }

        if (modulePathLookup.has(modulePath)) {
            return modulePathLookup.get(modulePath);
        }

        const sanitized = modulePath.replace(/["'\[\]]/g, "");
        if (modulePathLookup.has(sanitized)) {
            return modulePathLookup.get(sanitized);
        }

        return null;
    };
}

export function createLuauPathTransformer(resolveModulePath) {
    return (line) => {
        if (typeof line !== "string" || line.length === 0) {
            return line;
        }

        let transformed = line.replace(/\[string "([^\"]+)"\]/g, (fullMatch, modulePath) => {
            const resolved = resolveModulePath(modulePath);
            return resolved ?? fullMatch;
        });

        const moduleRootPattern =
            /(ServerScriptService|ReplicatedStorage\.shared|ReplicatedStorage\.client|ReplicatedFirst)(?:\.[^\s:\]]+)+/g;

        transformed = transformed.replace(moduleRootPattern, (fullMatch) => {
            const resolved = resolveModulePath(fullMatch);
            return resolved ?? fullMatch;
        });

        return transformed;
    };
}
