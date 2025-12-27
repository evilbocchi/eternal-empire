/**
 * Generates TypeScript interface definitions from Roblox DataModel trees.
 */

/**
 * Helper to check if a string is a valid TypeScript identifier
 * @param {string} str - String to validate
 * @returns {boolean}
 */
function isValidIdentifier(str) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(str);
}

/**
 * Recursively generates interface property definitions for a node's children.
 * @param {string} serviceName - Name of the service (used for nested interface names)
 * @param {object} node - Node with children to process
 * @param {number} depth - Current indentation depth
 * @returns {string} Interface property definitions
 */
export function generateInterfaceDefinition(serviceName, node, depth = 0) {
    const indent = "    ".repeat(depth);
    const childrenEntries = [];

    for (const child of node.children || []) {
        const childName = isValidIdentifier(child.name) ? child.name : JSON.stringify(child.name);
        const robloxType = child.className;

        if (child.children && child.children.length > 0) {
            // Generate a nested interface for this child
            const childInterfaceName = `${serviceName}_${child.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
            const childInterface = generateInterfaceDefinition(childInterfaceName, child, depth);
            childrenEntries.push(`${indent}    ${childName}: ${childInterfaceName};`);
            // Store child interface for later generation
            if (!generateInterfaceDefinition.childInterfaces) {
                generateInterfaceDefinition.childInterfaces = [];
            }
            generateInterfaceDefinition.childInterfaces.push({
                name: childInterfaceName,
                content: childInterface,
                baseType: robloxType,
            });
        } else {
            childrenEntries.push(`${indent}    ${childName}: ${robloxType};`);
        }
    }

    return childrenEntries.join("\n");
}

/**
 * Generates complete TypeScript service definitions from DataModel trees.
 * @param {Array} trees - Array of service tree objects
 * @returns {string} Complete TypeScript file content
 */
export function generateTypeScriptContent(trees) {
    const serviceNames = [
        "Workspace",
        "Players",
        "Lighting",
        "MaterialService",
        "ReplicatedFirst",
        "ReplicatedStorage",
        "ServerScriptService",
        "ServerStorage",
        "StarterGui",
        "StarterPack",
        "StarterPlayer",
        "Teams",
        "SoundService",
        "TextChatService",
    ];

    // Reset child interfaces for each generation
    generateInterfaceDefinition.childInterfaces = [];

    const interfaceDefinitions = [];

    for (let i = 0; i < trees.length && i < serviceNames.length; i++) {
        const tree = trees[i];
        const serviceName = serviceNames[i];

        if (tree && tree.children && tree.children.length > 0) {
            const childrenDef = generateInterfaceDefinition(serviceName, tree);

            if (childrenDef.trim()) {
                interfaceDefinitions.push(`interface ${serviceName} extends Instance {
${childrenDef}
}`);
            } else {
                interfaceDefinitions.push(`interface ${serviceName} extends Instance {}`);
            }
        } else {
            interfaceDefinitions.push(`interface ${serviceName} extends Instance {}`);
        }
    }

    // Add child interfaces
    for (const childInterface of generateInterfaceDefinition.childInterfaces || []) {
        if (childInterface.content.trim()) {
            interfaceDefinitions.push(`interface ${childInterface.name} extends ${childInterface.baseType} {
${childInterface.content}
}`);
        } else {
            interfaceDefinitions.push(`interface ${childInterface.name} extends ${childInterface.baseType} {}`);
        }
    }

    // Create a type that maps service names to their interfaces
    const serviceTypeEntries = serviceNames.map((name) => {
        const key = isValidIdentifier(name) ? name : JSON.stringify(name);
        return `    ${key}: ${name};`;
    });

    const content = `// AUTO-GENERATED FILE
// Do not edit manually.

// Roblox types must be available in your environment.

${interfaceDefinitions.join("\n\n")}

export type InstanceTreeType = {
${serviceTypeEntries.join("\n")}
};
`;

    // Normalize line endings to LF to match git's text=auto behavior
    return content.replace(/\r\n/g, "\n");
}
