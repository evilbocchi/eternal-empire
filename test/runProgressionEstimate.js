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
    const beginIndex = robloxLogs.findIndex((entry) => entry.message === REPORT_BEGIN_MARKER);
    const endIndex =
        beginIndex === -1
            ? -1
            : robloxLogs.findIndex((entry, index) => index > beginIndex && entry.message === REPORT_END_MARKER);

    let report = null;
    let rawJson = null;
    let jsonError = null;

    if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
        const chunks = robloxLogs.slice(beginIndex + 1, endIndex).map((entry) => entry.message);
        rawJson = chunks.join("");
        try {
            report = JSON.parse(rawJson);
        } catch (error) {
            jsonError = error instanceof Error ? error.message : String(error);
        }
    }

    const logs =
        beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex
            ? [...robloxLogs.slice(0, beginIndex), ...robloxLogs.slice(endIndex + 1)].map((entry) => entry.message)
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
