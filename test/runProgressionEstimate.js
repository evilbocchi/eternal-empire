import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import publish from "../sandbox/publish.js";
import { runCloudLuau } from "./cloudLuauRunner.js";
import { buildModulePathLookup, createLuauPathTransformer, createModulePathResolver } from "./luauPathUtils.js";

dotenv.config({ quiet: true });

const REPORT_BEGIN_MARKER = "__PROGRESSION_ESTIMATE_BEGIN__";
const REPORT_END_MARKER = "__PROGRESSION_ESTIMATE_END__";

const robloxLogs = [];

function log(message, level = "info") {
    const entry = { message: String(message), level };
    if (level === "log") {
        robloxLogs.push(entry);
    }
}

const repoRoot = path.join(import.meta.dirname, "..");
const paths = {
    template: path.join(repoRoot, "test", "templates", "progressionDashboard.html"),
    html: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION.html"),
    legacyHtml: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION.md"),
    metaCsv: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_meta.csv"),
    summaryCsv: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_summary.csv"),
    limitingCsv: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_limiting.csv"),
    progressionCsv: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_progression.csv"),
    longestCsv: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_top_longest.csv"),
    profilingCsv: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_profiling.csv"),
    logs: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_logs.txt"),
    rawJson: path.join(repoRoot, "docsout", "PROGRESS_ESTIMATION_raw.json"),
};

const dataFilePaths = [
    paths.html,
    paths.legacyHtml,
    paths.metaCsv,
    paths.summaryCsv,
    paths.limitingCsv,
    paths.progressionCsv,
    paths.longestCsv,
    paths.profilingCsv,
    paths.logs,
    paths.rawJson,
];

const modulePathLookup = buildModulePathLookup(repoRoot);
const resolveModulePath = createModulePathResolver(modulePathLookup);
const transformLuauPath = createLuauPathTransformer(resolveModulePath);
const scriptPath = path.join(import.meta.dirname, "scripts", "estimateProgress.luau");

function expandCompactReport(report) {
    if (!report || typeof report !== "object" || Array.isArray(report)) {
        return report;
    }

    if ("progression" in report || "summary" in report) {
        return report;
    }

    if (!("p" in report)) {
        return report;
    }

    const expandRevenue = (entries = []) =>
        entries.map((entry = {}) => ({
            currency: entry.c,
            formatted: entry.f,
            single: entry.s,
        }));

    const expandProgression = (entries = []) =>
        entries.map((entry = {}) => {
            const expanded = {
                order: entry.o,
                itemId: entry.i,
                itemName: entry.n,
                difficulty: entry.d,
                timeToObtainSeconds: entry.ts,
                timeToObtainLabel: entry.tl,
                cumulativeTimeSeconds: entry.cs,
                cumulativeTimeLabel: entry.cl,
                priceLabel: entry.p,
                limitingCurrency: entry.lc,
                limitingCurrencyLabel: entry.ll,
                isLong: entry.l,
                revenueBreakdown: expandRevenue(entry.rb),
                formulaResult: entry.fr,
                upgraderDetails: entry.ud,
            };

            return expanded;
        });

    const expandSummary = (summary = {}) => ({
        totalItems: summary.ti,
        longItems: summary.li,
        longItemThresholdSeconds: summary.lt,
        totalSimulatedTimeSeconds: summary.ts,
        totalSimulatedTimeLabel: summary.tl,
        averageTimeSeconds: summary.as,
        averageTimeLabel: summary.al,
        limitingCurrencyCounts: summary.lc ?? {},
    });

    const expandTopLongest = (entries = []) =>
        entries.map((entry = {}) => ({
            rank: entry.r,
            itemName: entry.n,
            timeLabel: entry.l,
            timeSeconds: entry.s,
        }));

    const expandProfiling = (profiling = {}) => ({
        totalExecutionTime: profiling.te,
        otherOperationsTime: profiling.oo,
        calculateRevenueTime: profiling.cr,
        calculateRevenueCount: profiling.cc,
        getNextItemTime: profiling.gn,
        getNextItemCount: profiling.gc,
        findShopTime: profiling.fs,
        findShopCount: profiling.fc,
        calcRevFirstLoopTime: profiling.c1,
        calcRevSecondLoopTime: profiling.c2,
        calcRevDropletLoopTime: profiling.cd,
        calcRevChargerTime: profiling.ch,
        calcRevOtherTime: profiling.co,
        dropletGetInstanceInfoTime: profiling.di,
        dropletSetUpgradesTime: profiling.su,
        dropletCalculateValueTime: profiling.cv,
        dropletApplyFurnacesTime: profiling.af,
    });

    const expandUpgrades = (entries = []) =>
        entries.map((entry = {}) => ({
            id: entry.i,
            amount: entry.a,
        }));

    const expandResetLayers = (entries = []) =>
        entries.map((entry = {}) => ({
            id: entry.i,
            rewardLabel: entry.l,
            rewardBreakdown: expandRevenue(entry.rb),
        }));

    return {
        generatedAt: report.g,
        runDurationSeconds: report.d,
        summary: expandSummary(report.s ?? {}),
        progression: expandProgression(report.p ?? []),
        topLongest: expandTopLongest(report.l ?? []),
        profiling: expandProfiling(report.f ?? {}),
        upgradesSimulated: expandUpgrades(report.u ?? []),
        resetLayersSimulated: expandResetLayers(report.r ?? []),
    };
}

function getProgressionLength(report) {
    if (!report) {
        return 0;
    }
    if (Array.isArray(report)) {
        return report.length;
    }
    if (Array.isArray(report.progression)) {
        return report.progression.length;
    }
    if (Array.isArray(report.p)) {
        return report.p.length;
    }
    return 0;
}

function csvEscape(value) {
    if (value === null || value === undefined) {
        return "";
    }
    const str = String(value);
    if (str.includes("\"") || str.includes(",") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function writeCsv(filePath, header, rows) {
    const lines = [];
    lines.push(header.map(csvEscape).join(","));
    for (const row of rows) {
        const values = Array.isArray(row) ? row : header.map((key) => row[key]);
        lines.push(values.map(csvEscape).join(","));
    }
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

function safeUnlink(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch {
        // ignore filesystem cleanup issues
    }
}

function clearGeneratedArtifacts() {
    for (const file of dataFilePaths) {
        safeUnlink(file);
    }
}

function copyTemplate() {
    try {
        const templateContent = fs.readFileSync(paths.template, "utf8");
        fs.writeFileSync(paths.html, templateContent, "utf8");
    } catch (error) {
        const fallback = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Eternal Empire Progression Dashboard</title>
    <style>
        body { font-family: sans-serif; background: #111; color: #eee; padding: 2rem; }
        pre { background: #1d1d1d; padding: 1rem; border-radius: 6px; }
    </style>
</head>
<body>
    <h1>Progression Dashboard</h1>
    <p>Unable to load dashboard template. The generated CSV files are still available alongside this HTML document.</p>
    <pre>${error instanceof Error ? error.message : String(error)}</pre>
</body>
</html>`;
        fs.writeFileSync(paths.html, fallback, "utf8");
    }
}

function writeArtifacts({ state, detail, report, logs, rawJson, jsonError, exportedAt }) {
    clearGeneratedArtifacts();

    const testoutDir = path.dirname(paths.html);
    if (!fs.existsSync(testoutDir)) {
        fs.mkdirSync(testoutDir, { recursive: true });
    }

    copyTemplate();

    const metaRows = [
        ["status", state ?? "unknown"],
        ["detail", detail ?? ""],
        ["exportedAt", exportedAt],
    ];

    if (report?.generatedAt) {
        metaRows.push(["generatedAt", report.generatedAt]);
    }

    if (typeof report?.runDurationSeconds === "number") {
        metaRows.push(["runDurationSeconds", report.runDurationSeconds]);
    }

    if (jsonError) {
        metaRows.push(["payloadError", jsonError]);
    }

    writeCsv(paths.metaCsv, ["key", "value"], metaRows);

    const logsContent = logs.length === 0 ? "No Roblox log entries captured." : logs.join("\n");
    fs.writeFileSync(paths.logs, logsContent, "utf8");

    if (rawJson && jsonError) {
        fs.writeFileSync(paths.rawJson, rawJson, "utf8");
    } else {
        safeUnlink(paths.rawJson);
    }

    if (!report) {
        return;
    }

    const summary = report.summary ?? {};
    const summaryRows = [
        ["totalItems", summary.totalItems ?? ""],
        ["longItems", summary.longItems ?? ""],
        ["longItemThresholdSeconds", summary.longItemThresholdSeconds ?? ""],
        ["totalSimulatedTimeSeconds", summary.totalSimulatedTimeSeconds ?? ""],
        ["totalSimulatedTimeLabel", summary.totalSimulatedTimeLabel ?? ""],
        ["averageTimeSeconds", summary.averageTimeSeconds ?? ""],
        ["averageTimeLabel", summary.averageTimeLabel ?? ""],
    ];
    writeCsv(paths.summaryCsv, ["metric", "value"], summaryRows);

    const limitingEntries = summary.limitingCurrencyCounts ? Object.entries(summary.limitingCurrencyCounts) : [];
    const limitingRows = limitingEntries.map(([currency, count]) => [currency, count]);
    writeCsv(paths.limitingCsv, ["currency", "count"], limitingRows);

    const progressionRows = (report.progression ?? []).map((entry) => [
        entry.order ?? "",
        entry.itemId ?? "",
        entry.itemName ?? "",
        entry.difficulty ?? "",
        entry.timeToObtainSeconds ?? "",
        entry.timeToObtainLabel ?? "",
        entry.cumulativeTimeSeconds ?? "",
        entry.cumulativeTimeLabel ?? "",
        entry.limitingCurrency ?? "",
        entry.limitingCurrencyLabel ?? "",
        entry.isLong === true ? "true" : entry.isLong === false ? "false" : entry.isLong ?? "",
    ]);
    writeCsv(
        paths.progressionCsv,
        [
            "order",
            "itemId",
            "itemName",
            "difficulty",
            "timeToObtainSeconds",
            "timeToObtainLabel",
            "cumulativeTimeSeconds",
            "cumulativeTimeLabel",
            "limitingCurrency",
            "limitingCurrencyLabel",
            "isLong",
        ],
        progressionRows,
    );

    const longestRows = (report.topLongest ?? []).map((entry) => [
        entry.rank ?? "",
        entry.itemName ?? "",
        entry.timeLabel ?? "",
        entry.timeSeconds ?? "",
    ]);
    writeCsv(paths.longestCsv, ["rank", "itemName", "timeLabel", "timeSeconds"], longestRows);

    const profilingEntries = Object.entries(report.profiling ?? {});
    const profilingRows = profilingEntries.map(([metric, value]) => [metric, value]);
    writeCsv(paths.profilingCsv, ["metric", "value"], profilingRows);
}

function extractReportPayload() {
    console.log(`\nAttempting to extract JSON payload from Roblox logs...`);
    console.log(`Total log entries: ${robloxLogs.length}`);

    const beginIndex = robloxLogs.findIndex((entry) => entry.message.trim() === REPORT_BEGIN_MARKER);
    const endIndex = beginIndex === -1
        ? robloxLogs.findIndex((entry) => entry.message.trim() === REPORT_END_MARKER)
        : robloxLogs.findIndex((entry, index) => index > beginIndex && entry.message.trim() === REPORT_END_MARKER);

    console.log(`BEGIN marker found at index: ${beginIndex}`);
    console.log(`END marker found at index: ${endIndex}`);

    let report = null;
    let rawJson = null;
    let jsonError = null;

    // Strategy 1: Marker-based extraction (ideal)
    if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
        console.log("Using marker-based extraction...");
        const chunks = robloxLogs.slice(beginIndex + 1, endIndex).map((entry) => entry.message);
        rawJson = chunks.join("");
        try {
            report = JSON.parse(rawJson);
            report = expandCompactReport(report);
            const parsedCount = getProgressionLength(report);
            console.log(`Successfully parsed JSON payload with ${parsedCount} items.`);
        } catch (error) {
            jsonError = error instanceof Error ? error.message : String(error);
            console.error("Failed to parse JSON:", jsonError);
        }
    }
    // Strategy 2: Fallback when BEGIN marker missing but END marker present
    else if (beginIndex === -1 && endIndex !== -1) {
        console.log("BEGIN marker missing, attempting fallback extraction...");
        
        // Join all logs before END marker
        const logsBeforeEnd = robloxLogs.slice(0, endIndex).map((entry) => entry.message).join("");
        
        // The first captured item starts mid-array; match the progression item key ("order" or compact "o")
        // Look for the pattern `"order":` or `"o":` which identifies progression items
        // (first char might be comma or space+comma depending on join behavior)
        const firstItemPattern = /"(?:order|o)":\s*\d+/;
        const firstItemMatch = logsBeforeEnd.match(firstItemPattern);
        
        if (firstItemMatch) {
            console.log(`Found truncated array start at position ${firstItemMatch.index}`);
            
            // Check what comes before the item key - should be a comma
            const beforeKey = logsBeforeEnd.substring(Math.max(0, firstItemMatch.index - 5), firstItemMatch.index);
            console.log(`Characters before item key: "${beforeKey}"`);
            
            // Find the comma before the item key
            const commaPos = logsBeforeEnd.lastIndexOf(',', firstItemMatch.index);
            
            if (commaPos !== -1) {
                console.log(`Found comma at position ${commaPos}, extracting from there...`);
                // Start from after the comma, prepend opening bracket and brace
                rawJson = "[{" + logsBeforeEnd.substring(commaPos + 1).trim();
            } else {
                console.error("Could not find comma before first item");
            }
        } else {
            console.error("Unable to find progression item pattern in logs.");
        }
        
        // Add closing bracket if needed
        if (rawJson && !rawJson.trim().endsWith("]")) {
            console.log("Appending missing ']' to complete array...");
            rawJson += "]";
        }
        
        if (rawJson) {
            try {
                // The extracted content might have extra JSON after the progression array
                // Try parsing as-is first
                report = JSON.parse(rawJson);
                report = expandCompactReport(report);
                const parsedCount = getProgressionLength(report);
                console.log(`Successfully parsed fallback JSON with ${parsedCount} items.`);
            } catch (error) {
                // If that fails, the extracted content has extra JSON after the progression array
                // The structure is: [{item},{item},...,{item}],"profiling":{...},"summary":{...}
                // We need to find where the main array closes (not nested arrays like revenueBreakdown)
                // Look for: }]," where the comma is followed by a JSON property name
                // To distinguish from nested arrays, we'll find ALL }], patterns and take the last one
                // before the total content ends
                
                console.log("Initial parse failed, looking for array boundary...");
                // Look for the specific pattern that marks the end of the progression array
                // The output structure is: [...progression items...],"profiling":{...}
                const arrayEndPattern = /\}\]\s*,\s*"(?:profiling|summary|upgradesSimulated|resetLayersSimulated|runDurationSeconds|generatedAt|topLongest|f|s|u|r|d|g|l)"/;
                const arrayEndMatch = rawJson.match(arrayEndPattern);
                
                if (arrayEndMatch) {
                    console.log(`Found array end pattern at position ${arrayEndMatch.index}`);
                    
                    // Extract just up to and including the }]
                    rawJson = rawJson.substring(0, arrayEndMatch.index + 2); // +2 for }]
                    
                    try {
                        report = JSON.parse(rawJson);
                        report = expandCompactReport(report);
                        const parsedCount = getProgressionLength(report);
                        console.log(`Successfully parsed trimmed JSON with ${parsedCount} items.`);
                        
                        // The parsed result is just the progression array (items 38-696)
                        // We need to wrap it in the expected report structure
                        if (Array.isArray(report)) {
                            console.log("Wrapping progression array in report structure...");
                            report = {
                                progression: report,
                                summary: {
                                    totalItems: report.length,
                                    longItems: 0,
                                    longItemThresholdSeconds: 1000,
                                    totalSimulatedTimeSeconds: 0,
                                    totalSimulatedTimeLabel: "Unknown (truncated)",
                                    averageTimeSeconds: 0,
                                    averageTimeLabel: "Unknown (truncated)",
                                    limitingCurrencyCounts: {},
                                },
                                topLongest: [],
                                profiling: {},
                                upgradesSimulated: [],
                                resetLayersSimulated: [],
                                generatedAt: new Date().toISOString(),
                                runDurationSeconds: null,
                            };
                        }
                    } catch (retryError) {
                        jsonError = retryError instanceof Error ? retryError.message : String(retryError);
                        console.error("Failed to parse trimmed JSON:", jsonError);
                        
                        // Save failed parse for debugging
                        const failedPath = path.join(import.meta.dirname, "../docsout/failed_parse.json");
                        fs.writeFileSync(failedPath, rawJson, "utf-8");
                        console.error(`Wrote failed JSON to ${failedPath} for inspection`);
                    }
                } else {
                    jsonError = error instanceof Error ? error.message : String(error);
                    console.error("Failed to parse fallback JSON and couldn't find array boundary:", jsonError);
                    
                    // Save failed parse for debugging
                    const failedPath = path.join(import.meta.dirname, "../docsout/failed_parse.json");
                    fs.writeFileSync(failedPath, rawJson, "utf-8");
                    console.error(`Wrote failed JSON to ${failedPath} for inspection`);
                }
            }
        }
    } else {
        console.error("Could not find required markers in logs.");
    }

    const logs =
        beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex
            ? [...robloxLogs.slice(0, beginIndex), ...robloxLogs.slice(endIndex + 1)].map((entry) => entry.message)
            : beginIndex === -1 && endIndex !== -1
            ? robloxLogs.slice(endIndex + 1).map((entry) => entry.message) // Fallback: skip everything before END marker
            : robloxLogs.map((entry) => entry.message);

    return { report, logs, rawJson, jsonError };
}

function finalize({ state, detail, exitCode }) {
    const exportedAt = new Date().toISOString();
    try {
        const payload = extractReportPayload();
        writeArtifacts({
            state,
            detail,
            report: payload.report,
            logs: payload.logs,
            rawJson: payload.rawJson,
            jsonError: payload.jsonError,
            exportedAt,
        });
    } catch (error) {
        console.error("Failed to generate progression artifacts:", error);
    }
    process.exit(exitCode);
}

async function main() {
    const originalStdoutWrite =
        typeof process?.stdout?.write === "function" ? process.stdout.write.bind(process.stdout) : null;

    let result;

    try {
        if (originalStdoutWrite) {
            process.stdout.write = () => true;
        }

        const PLACE_VERSION = await publish();

        result = await runCloudLuau(scriptPath, {
            placeVersion: PLACE_VERSION,
            log,
            transform: transformLuauPath,
        });
    } finally {
        if (originalStdoutWrite) {
            process.stdout.write = originalStdoutWrite;
        }
    }

    if (result === true) {
        finalize({ state: "success", detail: "Luau task completed successfully.", exitCode: 0 });
    } else if (result === false) {
        finalize({ state: "failure", detail: "Luau task reported failure.", exitCode: 1 });
    } else {
        log("Cloud execution skipped (missing configuration).", "warn");
        finalize({ state: "skipped", detail: "Cloud execution skipped (missing configuration).", exitCode: 0 });
    }
}

main().catch((error) => {
    console.log(`Progression estimation runner encountered an error: ${error?.message ?? String(error)}`);
    finalize({ state: "error", detail: error?.message ?? String(error), exitCode: 1 });
});
