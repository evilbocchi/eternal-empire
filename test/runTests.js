import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import signale from 'signale';

const logger = new signale.Signale();

dotenv.config();

// Add default headers to all axios requests to help avoid WAF blocks
axios.defaults.headers.common['User-Agent'] = 'Node.js/Roblox-Test-Runner';

const ROBLOX_API_KEY = process.env.LUAU_EXECUTION_API_KEY;
const ROBLOX_UNIVERSE_ID = process.env.LUAU_EXECUTION_UNIVERSE_ID;
const ROBLOX_PLACE_ID = process.env.LUAU_EXECUTION_PLACE_ID;

const scriptPath = path.join(import.meta.dirname, 'invoker.lua');

console.log(`Reading Luau script from: ${scriptPath}`);
const luauScript = fs.readFileSync(scriptPath, 'utf8');

async function createTask(apiKey, scriptContents, universeId, placeId) {
    try {
        const response = await axios.post(
            `https://apis.roblox.com/cloud/v2/universes/${universeId}/places/${placeId}/luau-execution-session-tasks`,
            {
                "script": scriptContents,
                "timeout": "3s"
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        return response.data;
    } catch (error) {
        logger.error('Error creating task:');
        logger.error('Status:', error.response?.status);
        logger.error('Status Text:', error.response?.statusText);
        logger.error('Data:', error.response?.data);
        logger.error('Request URL:', error.config?.url);
        if (error.response?.status === 403) {
            logger.error('This may be a WAF blocked request or authentication issue');
        }
        throw error;
    }
}

async function pollForTaskCompletion(apiKey, taskPath) {
    let task = null;
    
    while (!task || (task.state !== 'COMPLETE' && task.state !== 'FAILED')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            logger.info(`Polling task status at: https://apis.roblox.com/${taskPath}`);
            const response = await axios.get(
                `https://apis.roblox.com/cloud/v2/${taskPath}`,
                {
                    headers: {
                        'x-api-key': apiKey,
                    },
                }
            );
            
            task = response.data;
            console.log(`Task state: ${task.state}`);
        } catch (error) {
            logger.warn('Error polling task completion:');
            logger.warn('Status:', error.response?.status);
            logger.warn('Data:', error.response?.data);
            if (error.response?.status === 403) {
                logger.warn('WAF may be blocking polling requests');
            }
        }
    }
    
    return task;
}

async function getTaskLogs(apiKey, taskPath) {
    try {
        const response = await axios.get(
            `https://apis.roblox.com/cloud/v2/${taskPath}/logs`,
            {
                headers: {
                    'x-api-key': apiKey,
                },
            }
        );
        
        return response.data;
    } catch (error) {
        logger.error('Error getting task logs:');
        logger.error('Status:', error.response?.status);
        logger.error('Data:', error.response?.data);
        if (error.response?.status === 403) {
            logger.error('WAF may be blocking log retrieval requests');
        }
        throw error;
    }
}

async function runLuauTask(universeId, placeId, scriptContents) {
    logger.info('Executing Luau task');

    try {
        const task = await createTask(ROBLOX_API_KEY, scriptContents, universeId, placeId);
        logger.info(`Created task: ${task.path}`);

        const completedTask = await pollForTaskCompletion(ROBLOX_API_KEY, task.path);
        const logs = await getTaskLogs(ROBLOX_API_KEY, task.path);

        let failedTests = 0;
        let totalTests = 0;

        for (const taskLogs of logs.luauExecutionSessionTaskLogs) {
            const messages = taskLogs.messages;
            for (const message of messages) {
                logger.info(message);
                
                // Check for test result summary line (e.g., "36 passed, 0 failed, 0 skipped")
                const testResultMatch = message.match(/(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped/);
                if (testResultMatch) {
                    const passed = parseInt(testResultMatch[1]);
                    const failed = parseInt(testResultMatch[2]);
                    const skipped = parseInt(testResultMatch[3]);
                    
                    failedTests += failed;
                    totalTests += passed + failed + skipped;
                }
            }
        }

        if (completedTask.state === 'COMPLETE') {
            if (failedTests > 0) {
                logger.error(`Luau task completed but ${failedTests} test(s) failed`);
                return false;
            } else {
                logger.info('Luau task completed successfully with all tests passing');
                return true;
            }
        } else {
            logger.error('Luau task failed');
            return false;
        }
    } catch (error) {
        logger.error('Error executing Luau task:', error.response?.data || error.message);
        return false;
    }
}

async function runLuauScript() {
    // Check if API key is present
    if (!ROBLOX_API_KEY || !ROBLOX_UNIVERSE_ID || !ROBLOX_PLACE_ID) {
        logger.warn('Skipping tests: Required environment variables not set');
        logger.warn('Missing:');
        if (!ROBLOX_API_KEY) logger.warn('  - LUAU_EXECUTION_API_KEY');
        if (!ROBLOX_UNIVERSE_ID) logger.warn('  - LUAU_EXECUTION_UNIVERSE_ID');
        if (!ROBLOX_PLACE_ID) logger.warn('  - LUAU_EXECUTION_PLACE_ID');
        process.exit(0);
    }

    try {
        // Run the Luau script using that place version
        const success = await runLuauTask(ROBLOX_UNIVERSE_ID, ROBLOX_PLACE_ID, luauScript);
        
        if (success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        logger.error('Error in main execution:', error);
        process.exit(1);
    }
}

runLuauScript();