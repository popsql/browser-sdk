import { ConsoleApiName } from '../../tools/display';
import { toStackTraceString } from '../../tools/error';
import { assign, combine, jsonStringify, performDraw, includes, startsWith, arrayFrom } from '../../tools/utils';
import { getExperimentalFeatures, INTAKE_SITE_STAGING, INTAKE_SITE_US1_FED } from '../configuration';
import { computeStackTrace } from '../tracekit';
import { Observable } from '../../tools/observable';
import { timeStampNow } from '../../tools/timeUtils';
import { displayIfDebugEnabled, startMonitorErrorCollection } from '../../tools/monitor';
import { TelemetryType } from './rawTelemetryEvent.types';
var ALLOWED_FRAME_URLS = [
    'https://www.datadoghq-browser-agent.com',
    'https://www.datad0g-browser-agent.com',
    'http://localhost',
    '<anonymous>',
];
var TELEMETRY_EXCLUDED_SITES = [INTAKE_SITE_US1_FED];
var telemetryConfiguration = { maxEventsPerPage: 0, sentEventCount: 0, telemetryEnabled: false, telemetryConfigurationEnabled: false };
var onRawTelemetryEventCollected;
export function startTelemetry(telemetryService, configuration) {
    var contextProvider;
    var observable = new Observable();
    telemetryConfiguration.telemetryEnabled = performDraw(configuration.telemetrySampleRate);
    telemetryConfiguration.telemetryConfigurationEnabled =
        telemetryConfiguration.telemetryEnabled && performDraw(configuration.telemetryConfigurationSampleRate);
    onRawTelemetryEventCollected = function (event) {
        if (!includes(TELEMETRY_EXCLUDED_SITES, configuration.site) && telemetryConfiguration.telemetryEnabled) {
            observable.notify(toTelemetryEvent(telemetryService, event));
        }
    };
    startMonitorErrorCollection(addTelemetryError);
    assign(telemetryConfiguration, {
        maxEventsPerPage: configuration.maxTelemetryEventsPerPage,
        sentEventCount: 0,
    });
    function toTelemetryEvent(telemetryService, event) {
        return combine({
            type: 'telemetry',
            date: timeStampNow(),
            service: telemetryService,
            version: "dev",
            source: 'browser',
            _dd: {
                format_version: 2,
            },
            telemetry: event,
            experimental_features: arrayFrom(getExperimentalFeatures()),
        }, contextProvider !== undefined ? contextProvider() : {});
    }
    return {
        setContextProvider: function (provider) {
            contextProvider = provider;
        },
        observable: observable,
    };
}
export function startFakeTelemetry() {
    var events = [];
    assign(telemetryConfiguration, {
        maxEventsPerPage: Infinity,
        sentEventCount: 0,
    });
    onRawTelemetryEventCollected = function (event) {
        events.push(event);
    };
    return events;
}
export function resetTelemetry() {
    onRawTelemetryEventCollected = undefined;
}
/**
 * Avoid mixing telemetry events from different data centers
 * but keep replicating staging events for reliability
 */
export function isTelemetryReplicationAllowed(configuration) {
    return configuration.site === INTAKE_SITE_STAGING;
}
export function addTelemetryDebug(message, context) {
    displayIfDebugEnabled(ConsoleApiName.debug, message, context);
    addTelemetry(assign({
        type: TelemetryType.log,
        message: message,
        status: "debug" /* debug */,
    }, context));
}
export function addTelemetryError(e) {
    addTelemetry(assign({
        type: TelemetryType.log,
        status: "error" /* error */,
    }, formatError(e)));
}
export function addTelemetryConfiguration(configuration) {
    if (telemetryConfiguration.telemetryConfigurationEnabled) {
        addTelemetry({
            type: TelemetryType.configuration,
            configuration: configuration,
        });
    }
}
function addTelemetry(event) {
    if (onRawTelemetryEventCollected && telemetryConfiguration.sentEventCount < telemetryConfiguration.maxEventsPerPage) {
        telemetryConfiguration.sentEventCount += 1;
        onRawTelemetryEventCollected(event);
    }
}
export function formatError(e) {
    if (e instanceof Error) {
        var stackTrace = computeStackTrace(e);
        return {
            error: {
                kind: stackTrace.name,
                stack: toStackTraceString(scrubCustomerFrames(stackTrace)),
            },
            message: stackTrace.message,
        };
    }
    return {
        error: {
            stack: 'Not an instance of error',
        },
        message: "Uncaught ".concat(jsonStringify(e)),
    };
}
export function scrubCustomerFrames(stackTrace) {
    stackTrace.stack = stackTrace.stack.filter(function (frame) { return !frame.url || ALLOWED_FRAME_URLS.some(function (allowedFrameUrl) { return startsWith(frame.url, allowedFrameUrl); }); });
    return stackTrace;
}
//# sourceMappingURL=telemetry.js.map