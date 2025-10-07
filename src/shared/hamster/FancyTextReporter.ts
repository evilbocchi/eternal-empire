import TestEZ from "@rbxts/testez";
import Reporter from "@rbxts/testez/src/Reporters/Reporter";
import type RunResults from "@rbxts/testez/src/RunResults";

const TestEnum = TestEZ.TestEnum;
const StatusTable = TestEnum.TestStatus;
type TestStatusValue = (typeof StatusTable)[keyof typeof StatusTable];
const TestService = game.GetService("TestService");

type ResultNode = {
    readonly planNode: {
        readonly phrase: string;
    };
    readonly status?: TestStatusValue;
    readonly children: ReadonlyArray<ResultNode>;
};

type ReporterResults = {
    readonly errors: ReadonlyArray<string>;
    readonly failureCount: number;
    readonly skippedCount: number;
    readonly successCount: number;
    readonly planNode: {
        readonly phrase: string;
    };
    readonly status?: TestStatusValue;
    readonly children: ReadonlyArray<ResultNode>;
};

type FancyReporter = Reporter & {
    getLines(): ReadonlyArray<string>;
    getFailures(): ReadonlyArray<string>;
};

interface StatusMeta {
    readonly icon: string;
    readonly label: string;
}

const BRANCH_LAST = "└─";
const BRANCH_MIDDLE = "├─";
const BRANCH_FIRST = "╭─";
const BRANCH_ONLY = "╰─";
const INDENT_KEEP = "│  ";
const INDENT_CLEAR = "   ";

function cloneAndSort(nodes: ReadonlyArray<ResultNode>): ResultNode[] {
    const clone = new Array<ResultNode>();
    const source = [...nodes];
    for (let index = 0; index < source.size(); index++) {
        const node = source[index];
        if (node !== undefined) {
            clone.push(node);
        }
    }

    table.sort(clone, (a, b) => string.lower(a.planNode.phrase) < string.lower(b.planNode.phrase));
    return clone;
}

function statusMetaFor(nodeStatus: TestStatusValue | undefined, depth: number): StatusMeta {
    if (!nodeStatus) {
        return {
            icon: depth === 0 ? "🧪" : "📂",
            label: depth === 0 ? "SUITE" : "GROUP",
        };
    }

    if (nodeStatus === StatusTable.Success) {
        return { icon: "✅", label: "PASS" };
    }
    if (nodeStatus === StatusTable.Failure) {
        return { icon: "❌", label: "FAIL" };
    }
    if (nodeStatus === StatusTable.Skipped) {
        return { icon: "⏭", label: "SKIP" };
    }

    return { icon: "❓", label: "???" };
}

function stringLength(text: string): number {
    return text.split("").size();
}

function center(text: string, width: number): string {
    const delta = math.max(width - stringLength(text), 0);
    const left = math.floor(delta / 2);
    const right = delta - left;
    return `${string.rep(" ", left)}${text}${string.rep(" ", right)}`;
}

function buildBannerLines(successCount: number, failureCount: number, skippedCount: number): string[] {
    const total = successCount + failureCount + skippedCount;
    const statusEmoji = failureCount > 0 ? "❌" : skippedCount > 0 ? "⚠️" : "✅";
    const title = `${statusEmoji} Hamster Test Run`;
    const summary = `${successCount} passed · ${failureCount} failed · ${skippedCount} skipped · ${total} total`;

    const contentWidth = math.max(stringLength(title), stringLength(summary));
    const horizontal = string.rep("─", contentWidth + 2);

    const framed = new Array<string>();
    framed.push(`╭${horizontal}╮`);
    framed.push(`│ ${center(title, contentWidth)} │`);
    framed.push(`│ ${center(summary, contentWidth)} │`);
    framed.push(`╰${horizontal}╯`);
    return framed;
}

function renderNode(
    node: ResultNode,
    depth: number,
    prefix: string,
    isLast: boolean,
    isFirst: boolean,
    output: string[],
    failurePhrases: string[],
): void {
    if (node.status === StatusTable.Skipped) {
        return;
    }

    const meta = statusMetaFor(node.status, depth);
    const pieces = new Array<string>();
    pieces.push(meta.icon);
    if (stringLength(meta.label) > 0) {
        pieces.push(meta.label);
    }
    pieces.push(node.planNode.phrase);

    let branch: string;
    if (stringLength(prefix) === 0) {
        branch = isLast ? BRANCH_ONLY : isFirst ? BRANCH_FIRST : BRANCH_MIDDLE;
    } else {
        branch = isLast ? BRANCH_LAST : BRANCH_MIDDLE;
    }

    output.push(`${prefix}${branch} ${pieces.join(" ")}`);

    if (node.status === StatusTable.Failure && node.children.isEmpty()) {
        failurePhrases.push(node.planNode.phrase);
    }

    const sortedChildren = cloneAndSort(node.children);
    const nextPrefix = `${prefix}${isLast ? INDENT_CLEAR : INDENT_KEEP}`;

    for (let index = 0; index < sortedChildren.size(); index++) {
        const child = sortedChildren[index];
        renderNode(
            child,
            depth + 1,
            nextPrefix,
            index === sortedChildren.size() - 1,
            index === 0,
            output,
            failurePhrases,
        );
    }
}

function buildTreeLines(results: ReporterResults, failurePhrases: string[]): string[] {
    const lines = new Array<string>();
    const sortedRoots = cloneAndSort(results.children);

    for (let index = 0; index < sortedRoots.size(); index++) {
        const child = sortedRoots[index];
        renderNode(child, 0, "", index === sortedRoots.size() - 1, index === 0, lines, failurePhrases);
    }

    return lines;
}

function createReporterPayload(results: ReporterResults) {
    const failurePhrases = new Array<string>();
    const output = new Array<string>();

    const banner = buildBannerLines(results.successCount, results.failureCount, results.skippedCount);
    for (let index = 0; index < banner.size(); index++) {
        const line = banner[index];
        if (line !== undefined) {
            output.push(line);
        }
    }

    const treeLines = buildTreeLines(results, failurePhrases);
    if (treeLines.size() > 0) {
        output.push("");
        for (let index = 0; index < treeLines.size(); index++) {
            const line = treeLines[index];
            if (line !== undefined) {
                output.push(line);
            }
        }
    }

    if (failurePhrases.size() > 0) {
        output.push("");
        output.push(`❌ ${failurePhrases.size()} failing ${failurePhrases.size() === 1 ? "test" : "tests"}:`);
        for (let index = 0; index < failurePhrases.size(); index++) {
            const phrase = failurePhrases[index];
            if (phrase !== undefined) {
                output.push(`   • ${phrase}`);
            }
        }
    }

    return { lines: output, failures: failurePhrases };
}

export function createFancyTextReporter(): FancyReporter {
    let capturedLines = new Array<string>();
    let capturedFailures = new Array<string>();

    const report = (results: RunResults) => {
        const typedResults = results as unknown as ReporterResults;
        const payload = createReporterPayload(typedResults);
        capturedLines = payload.lines;
        capturedFailures = payload.failures;

        for (let index = 0; index < capturedLines.size(); index++) {
            const line = capturedLines[index];
            if (line !== undefined) {
                print(line);
            }
        }

        const errors = [...typedResults.errors];
        for (let index = 0; index < errors.size(); index++) {
            const message = errors[index];
            if (message !== undefined) {
                TestService.Error(message);
            }
        }
    };

    return {
        report,
        getLines() {
            return capturedLines;
        },
        getFailures() {
            return capturedFailures;
        },
    };
}
