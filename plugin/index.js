#!/usr/bin/env node

import express from 'express';
import fs from 'fs';
import signale from 'signale';

const app = express();
app.use(express.json());

// Use parsed options
const PORT = 28354;
const OUTPUT = 'src/services.d.ts';

function generateInterfaceDefinition (serviceName, node, depth = 0) {
    const indent = '    '.repeat(depth);
    const childrenEntries = [];

    for (const child of node.children || []) {
        const childName = JSON.stringify(child.name);
        const robloxType = child.className;

        if (child.children && child.children.length > 0) {
            // Generate a nested interface for this child
            const childInterfaceName = `${serviceName}_${child.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const childInterface = generateInterfaceDefinition(childInterfaceName, child, depth);
            childrenEntries.push(`${indent}    ${childName}: ${childInterfaceName};`);
            // Store child interface for later generation
            if (!generateInterfaceDefinition.childInterfaces) {
                generateInterfaceDefinition.childInterfaces = [];
            }
            generateInterfaceDefinition.childInterfaces.push({
                name: childInterfaceName,
                content: childInterface,
                baseType: robloxType
            });
        } else {
            childrenEntries.push(`${indent}    ${childName}: ${robloxType};`);
        }
    }

    return childrenEntries.join('\n');
}

function generateTypeScriptContent (trees) {
    const serviceNames = [
        'Workspace', 'Players', 'Lighting', 'MaterialService', 'ReplicatedFirst',
        'ReplicatedStorage', 'ServerScriptService', 'ServerStorage', 'StarterGui',
        'StarterPack', 'StarterPlayer', 'Teams', 'SoundService', 'TextChatService'
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
            }
            else {
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
    const serviceTypeEntries = serviceNames.map(name => `    ${JSON.stringify(name)}: ${name};`);

    return `// AUTO-GENERATED FILE
// Do not edit manually.

// Roblox types must be available in your environment.

${interfaceDefinitions.join('\n\n')}

export type InstanceTreeType = {
${serviceTypeEntries.join('\n')}
};
`;
}

app.post('/write', (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return res.status(400).send('Missing or invalid JSON body.');
    }

    const content = generateTypeScriptContent(body);
    // Read the current file contents first
    fs.readFile(OUTPUT, 'utf8', (readErr, currentContent) => {
        if (!readErr && currentContent === content) {
            // No change, do not write
            return res.send(`No changes detected in ${OUTPUT}`);
        }
        // Write only if different or file does not exist
        fs.writeFile(OUTPUT, content, (writeErr) => {
            if (writeErr) {
                return res.status(500).send('Failed to write to file.');
            }
            res.send(`Written to ${OUTPUT}`);
        });
    });
});

app.listen(PORT, () => {
    signale.info(`Plugin server running at http://localhost:${PORT}`);
});
