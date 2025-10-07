import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import signale from 'signale';

const logger = new signale.Signale();

dotenv.config();

// Add default headers to all axios requests to help avoid WAF blocks
axios.defaults.headers.common['User-Agent'] = 'Node.js/Roblox-Test-Runner';

const STUDIO_TEST_MODE = (process.env.STUDIO_TEST_MODE ?? 'auto').toLowerCase();
const STUDIO_TEST_SERVER = process.env.STUDIO_TEST_SERVER ?? 'http://localhost:28354';
const parsedTimeout = Number.parseInt(process.env.STUDIO_REQUEST_TIMEOUT ?? '5000', 10);
const STUDIO_REQUEST_TIMEOUT = Number.isFinite(parsedTimeout) ? parsedTimeout : 5000;

const ROBLOX_API_KEY = process.env.LUAU_EXECUTION_API_KEY;
const ROBLOX_UNIVERSE_ID = process.env.LUAU_EXECUTION_UNIVERSE_ID;
const ROBLOX_PLACE_ID = process.env.LUAU_EXECUTION_PLACE_ID;

const scriptPath = path.join(import.meta.dirname, 'invoker.lua');

console.log(`Reading Luau script from: ${scriptPath}`);
const luauScript = fs.readFileSync(scriptPath, 'utf8');

async function runStudioTests() {
    logger.info(`Checking Studio plugin server at ${STUDIO_TEST_SERVER}`);

    let statusResponse;
    try {
        statusResponse = await axios.get(`${STUDIO_TEST_SERVER}/test/status`, { timeout: STUDIO_REQUEST_TIMEOUT });
    } catch (error) {
        const reason = error.code ?? error.message ?? String(error);
        logger.warn(`Studio plugin server not reachable (${reason}).`);
        return null;
    }

    const statusData = statusResponse.data ?? {};
    if (!statusData.streamConnected) {
        logger.warn('Studio plugin server reachable but no Studio instance is connected.');
        return null;
    }

    try {
        const response = await axios.post(`${STUDIO_TEST_SERVER}/test/run`, {}, {
            responseType: 'stream',
            timeout: 0,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        return await new Promise((resolve, reject) => {
            const stream = response.data;
            let buffer = '';
            let finalPayload = null;
            let resolved = false;

            const handleLine = (line) => {
                const trimmed = line.trim();
                if (!trimmed.startsWith('__RESULT__')) {
                    return;
                }

                const jsonText = trimmed.slice('__RESULT__'.length).trim();
                if (jsonText.length === 0) {
                    return;
                }

                try {
                    finalPayload = JSON.parse(jsonText);
                } catch (jsonError) {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error(`Failed to parse Studio test result JSON: ${jsonError.message}`));
                    }
                }
            };

            stream.on('data', (chunk) => {
                if (resolved) {
                    return;
                }

                const text = chunk.toString();
                process.stdout.write(text);
                buffer += text;

                let newlineIndex = buffer.indexOf('\n');
                while (newlineIndex !== -1) {
                    const line = buffer.slice(0, newlineIndex);
                    buffer = buffer.slice(newlineIndex + 1);
                    handleLine(line);
                    newlineIndex = buffer.indexOf('\n');
                }
            });

            stream.on('end', () => {
                if (resolved) {
                    return;
                }

                if (buffer.length > 0) {
                    handleLine(buffer);
                }

                if (finalPayload) {
                    resolved = true;
                    resolve(finalPayload);
                } else {
                    resolved = true;
                    reject(new Error('Studio stream ended without emitting a result payload.'));
                }
            });

            stream.on('error', (streamError) => {
                if (!resolved) {
                    resolved = true;
                    reject(streamError);
                }
            });
        });
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const statusText = error.response.statusText || 'Unknown';

            if (status === 503) {
                logger.warn('Studio plugin server reports no connected Studio instance.');
                return null;
            }

            if (status === 409) {
                return {
                    success: false,
                    summary: null,
                    error: 'Studio refused the test run because another run is already in progress.',
                };
            }

            return {
                success: false,
                summary: null,
                error: `Studio server responded with status ${status} (${statusText}).`,
            };
        }

        const reason = error.message ?? String(error);
        return {
            success: false,
            summary: null,
            error: `Failed to request Studio test run: ${reason}`,
        };
    }
}

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

async function runCloudTests() {
    if (!ROBLOX_API_KEY || !ROBLOX_UNIVERSE_ID || !ROBLOX_PLACE_ID) {
        logger.warn('Skipping cloud tests: Required environment variables not set');
        logger.warn('Missing:');
        if (!ROBLOX_API_KEY) logger.warn('  - LUAU_EXECUTION_API_KEY');
        if (!ROBLOX_UNIVERSE_ID) logger.warn('  - LUAU_EXECUTION_UNIVERSE_ID');
        if (!ROBLOX_PLACE_ID) logger.warn('  - LUAU_EXECUTION_PLACE_ID');
        return null;
    }

    try {
        const success = await runLuauTask(ROBLOX_UNIVERSE_ID, ROBLOX_PLACE_ID, luauScript);
        return success;
    } catch (error) {
        logger.error('Error in cloud test execution:', error.response?.data || error.message || error);
        return false;
    }
}

async function main() {
    let studioResult = null;

    if (STUDIO_TEST_MODE !== 'cloud') {
        try {
            studioResult = await runStudioTests();
        } catch (error) {
            const message = error?.message ?? String(error);
            logger.error(`Studio test runner encountered an error: ${message}`);
            studioResult = {
                success: false,
                summary: null,
                error: message,
            };
        }

        if (studioResult) {
            const summary = studioResult.summary;
            if (summary) {
                const passCount = summary.successCount ?? 0;
                const failCount = summary.failureCount ?? 0;
                const skipCount = summary.skippedCount ?? 0;
                const duration = summary.durationMs ?? 0;
                logger.info(`Studio summary: ${passCount} passed, ${failCount} failed, ${skipCount} skipped (${duration}ms).`);
            }

            if (studioResult.success) {
                logger.success('Studio tests passed successfully.');
                process.exit(0);
            } else {
                const reason = studioResult.error ? ` (${studioResult.error})` : '';
                logger.error(`Studio tests failed${reason}`);
                process.exit(1);
            }
        } else if (STUDIO_TEST_MODE === 'studio') {
            logger.error('Studio test runner was requested (STUDIO_TEST_MODE=studio) but is unavailable.');
            process.exit(1);
        }
    }

    if (STUDIO_TEST_MODE !== 'studio') {
        const cloudResult = await runCloudTests();

        if (cloudResult === true) {
            logger.success('Cloud tests passed successfully.');
            process.exit(0);
        } else if (cloudResult === false) {
            logger.error('Cloud tests failed.');
            process.exit(1);
        } else if (STUDIO_TEST_MODE === 'cloud') {
            logger.warn('Cloud tests requested, but environment variables are missing; skipping.');
            process.exit(0);
        }
    }

    logger.warn('No test runner executed; skipping tests.');
    process.exit(0);
}

main().catch((error) => {
    logger.error('Unhandled error during test execution:', error);
    process.exit(1);
});