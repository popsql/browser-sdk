import type { Context } from '../../tools/context';
import type { Configuration } from '../configuration';
import type { StackTrace } from '../tracekit';
import { Observable } from '../../tools/observable';
import type { TelemetryEvent } from './telemetryEvent.types';
import type { RawTelemetryConfiguration } from './rawTelemetryEvent.types';
export declare const enum TelemetryService {
    LOGS = "browser-logs-sdk",
    RUM = "browser-rum-sdk"
}
export interface Telemetry {
    setContextProvider: (provider: () => Context) => void;
    observable: Observable<TelemetryEvent & Context>;
}
export declare function startTelemetry(telemetryService: TelemetryService, configuration: Configuration): Telemetry;
export declare function startFakeTelemetry(): ({
    [k: string]: unknown;
    type?: "log" | undefined;
    status: "error";
    message: string;
    error?: {
        [k: string]: unknown;
        stack?: string | undefined;
        kind?: string | undefined;
    } | undefined;
} | {
    [k: string]: unknown;
    type?: "log" | undefined;
    status: "debug";
    message: string;
} | {
    [k: string]: unknown;
    type: "configuration";
    configuration: {
        [k: string]: unknown;
        session_sample_rate?: number | undefined;
        telemetry_sample_rate?: number | undefined;
        telemetry_configuration_sample_rate?: number | undefined;
        trace_sample_rate?: number | undefined;
        premium_sample_rate?: number | undefined;
        replay_sample_rate?: number | undefined;
        session_replay_sample_rate?: number | undefined;
        use_proxy?: boolean | undefined;
        use_before_send?: boolean | undefined;
        silent_multiple_init?: boolean | undefined;
        track_session_across_subdomains?: boolean | undefined;
        use_cross_site_session_cookie?: boolean | undefined;
        use_secure_session_cookie?: boolean | undefined;
        action_name_attribute?: string | undefined;
        use_allowed_tracing_origins?: boolean | undefined;
        default_privacy_level?: string | undefined;
        use_excluded_activity_urls?: boolean | undefined;
        track_frustrations?: boolean | undefined;
        track_views_manually?: boolean | undefined;
        track_interactions?: boolean | undefined;
        forward_errors_to_logs?: boolean | undefined;
        forward_console_logs?: string[] | "all" | undefined;
        forward_reports?: string[] | "all" | undefined;
        use_local_encryption?: boolean | undefined;
        view_tracking_strategy?: "ActivityViewTrackingStrategy" | "FragmentViewTrackingStrategy" | "MixedViewTrackingStrategy" | "NavigationViewTrackingStrategy" | undefined;
        track_background_events?: boolean | undefined;
        mobile_vitals_update_period?: number | undefined;
        track_native_crashes?: boolean | undefined;
    };
})[];
export declare function resetTelemetry(): void;
/**
 * Avoid mixing telemetry events from different data centers
 * but keep replicating staging events for reliability
 */
export declare function isTelemetryReplicationAllowed(configuration: Configuration): boolean;
export declare function addTelemetryDebug(message: string, context?: Context): void;
export declare function addTelemetryError(e: unknown): void;
export declare function addTelemetryConfiguration(configuration: RawTelemetryConfiguration): void;
export declare function formatError(e: unknown): {
    error: {
        kind: string | undefined;
        stack: string;
    };
    message: string;
} | {
    error: {
        stack: string;
        kind?: undefined;
    };
    message: string;
};
export declare function scrubCustomerFrames(stackTrace: StackTrace): StackTrace;
