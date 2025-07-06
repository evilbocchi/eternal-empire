import { HttpService } from "@rbxts/services";

/**
 * Utility class for generating and working with UUIDs.
 */
export default class UUID {
    /**
     * Generates a version 4 UUID using Roblox's HttpService.
     * 
     * @returns A new UUID string in standard format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx).
     */
    static generate(): string {
        return HttpService.GenerateGUID(false);
    }

    /**
     * Validates if a string is a valid UUID format.
     * 
     * @param uuid The string to validate.
     * @returns True if the string is a valid UUID format, false otherwise.
     */
    static isValid(uuid: string): boolean {
        // Check basic format: 8-4-4-4-12 characters with hyphens
        const parts = uuid.split("-");
        if (parts.size() !== 5) {
            return false;
        }
        
        if (parts[0].size() !== 8 || parts[1].size() !== 4 || parts[2].size() !== 4 || 
            parts[3].size() !== 4 || parts[4].size() !== 12) {
            return false;
        }

        // Check that all parts contain only hexadecimal characters
        for (const part of parts) {
            if (!part.match("^[0-9a-fA-F]+$")[0]) {
                return false;
            }
        }

        return true;
    }
}