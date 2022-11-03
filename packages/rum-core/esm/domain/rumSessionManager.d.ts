import type { RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from './configuration';
import type { LifeCycle } from './lifeCycle';
export declare const RUM_SESSION_KEY = "rum";
export interface RumSessionManager {
    findTrackedSession: (startTime?: RelativeTime) => RumSession | undefined;
}
export declare type RumSession = {
    id: string;
    plan: RumSessionPlan;
    sessionReplayAllowed: boolean;
    longTaskAllowed: boolean;
    resourceAllowed: boolean;
};
export declare const enum RumSessionPlan {
    WITHOUT_SESSION_REPLAY = 1,
    WITH_SESSION_REPLAY = 2
}
export declare const enum RumTrackingType {
    NOT_TRACKED = "0",
    TRACKED_WITH_SESSION_REPLAY = "1",
    TRACKED_WITHOUT_SESSION_REPLAY = "2"
}
export declare function startRumSessionManager(configuration: RumConfiguration, lifeCycle: LifeCycle): RumSessionManager;
/**
 * Start a tracked replay session stub
 */
export declare function startRumSessionManagerStub(): RumSessionManager;
