/**
 * @fileoverview Monitors game performance and system health.
 *
 * This service provides:
 * - Physics throttling detection and warnings
 * - Server performance monitoring
 * - Development environment detection
 * - Real-time system health checks
 *
 * The service continuously monitors critical game systems and warns developers
 * when performance issues are detected, helping maintain optimal game performance.
 *
 * @since 1.0.0
 */

import { simpleInterval } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import eat from "shared/hamster/eat";

/**
 * Service that monitors game performance and system health.
 *
 * Provides real-time monitoring of physics throttling and other performance
 * metrics to help identify and diagnose performance issues during development.
 */
@Service()
export default class DiagnosticService implements OnStart {
    /**
     * Initializes the DiagnosticService.
     * Currently unused but required by the OnStart interface.
     */
    onInit() {}

    /**
     * Starts the DiagnosticService and begins performance monitoring.
     *
     * Spawns a continuous monitoring task that checks physics throttling
     * every 2 seconds and warns when performance degrades below acceptable levels.
     */
    onStart() {
        const cleanup = simpleInterval(() => {
            const throttling = Workspace.GetPhysicsThrottling();
            if (throttling < 100) {
                warn("Physics is being throttled!", throttling);
            }
        }, 2);
        eat(cleanup);
    }
}
