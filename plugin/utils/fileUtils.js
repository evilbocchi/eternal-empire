import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Writes content to a file only if it differs from the current content.
 * @param {string} filePath - Absolute path to the file
 * @param {string} content - Content to write
 * @param {string} repoRoot - Repository root path for relative path display
 * @returns {Promise<{message: string, changed: boolean}>}
 */
export async function writeFileIfChanged(filePath, content, repoRoot) {
    const relativePath = path.relative(repoRoot, filePath);

    // Normalize content to LF line endings for consistent comparison
    const normalizedContent = content.replace(/\r\n/g, "\n");

    try {
        const currentContent = await readFile(filePath, "utf8");
        const normalizedCurrentContent = currentContent.replace(/\r\n/g, "\n");

        if (normalizedCurrentContent === normalizedContent) {
            return { message: `No changes detected in ${relativePath}`, changed: false };
        }
    } catch (error) {
        if (error?.code !== "ENOENT") {
            throw error;
        }
    }

    await writeFile(filePath, normalizedContent);
    return { message: `Written to ${relativePath}`, changed: true };
}
