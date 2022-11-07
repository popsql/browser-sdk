"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrubCustomerFrames = exports.formatError = exports.addTelemetryConfiguration = exports.addTelemetryError = exports.addTelemetryDebug = exports.isTelemetryReplicationAllowed = exports.resetTelemetry = exports.startFakeTelemetry = exports.startTelemetry = void 0;
var display_1 = require("../../tools/display");
var error_1 = require("../../tools/error");
var utils_1 = require("../../tools/utils");
var configuration_1 = require("../configuration");
var tracekit_1 = require("../tracekit");
var observable_1 = require("../../tools/observable");
var timeUtils_1 = require("../../tools/timeUtils");
var monitor_1 = require("../../tools/monitor");
var rawTelemetryEvent_types_1 = require("./rawTelemetryEvent.types");
var ALLOWED_FRAME_URLS = [
    'https://www.datadoghq-browser-agent.com',
    'https://www.datad0g-browser-agent.com',
    'http://localhost',
    '<anonymous>',
];
var TELEMETRY_EXCLUDED_SITES = [configuration_1.INTAKE_SITE_US1_FED];
var telemetryConfiguration = { maxEventsPerPage: 0, sentEventCount: 0, telemetryEnabled: false, telemetryConfigurationEnabled: false };
var onRawTelemetryEventCollected;
function startTelemetry(telemetryService, configuration) {
    var contextProvider;
    var observable = new observable_1.Observable();
    telemetryConfiguration.telemetryEnabled = (0, utils_1.performDraw)(configuration.telemetrySampleRate);
    telemetryConfiguration.telemetryConfigurationEnabled =
        telemetryConfiguration.telemetryEnabled && (0, utils_1.performDraw)(configuration.telemetryConfigurationSampleRate);
    onRawTelemetryEventCollected = function (event) {
        if (!(0, utils_1.includes)(TELEMETRY_EXCLUDED_SITES, configuration.site) && telemetryConfiguration.telemetryEnabled) {
            observable.notify(toTelemetryEvent(telemetryService, event));
        }
    };
    (0, monitor_1.startMonitorErrorCollection)(addTelemetryError);
    (0, utils_1.assign)(telemetryConfiguration, {
        maxEventsPerPage: configuration.maxTelemetryEventsPerPage,
        sentEventCount: 0,
    });
    function toTelemetryEvent(telemetryService, event) {
        return (0, utils_1.combine)({
            type: 'telemetry',
            date: (0, timeUtils_1.timeStampNow)(),
            service: telemetryService,
            version: "dev",
            source: 'browser',
            _dd: {
                format_version: 2,
            },
            telemetry: event,
            experimental_features: (0, utils_1.arrayFrom)((0, configuration_1.getExperimentalFeatures)()),
        }, contextProvider !== undefined ? contextProvider() : {});
    }
    return {
        setContextProvider: function (provider) {
            contextProvider = provider;
        },
        observable: observable,
    };
}
exports.startTelemetry = startTelemetry;
function startFakeTelemetry() {
    var events = [];
    (0, utils_1.assign)(telemetryConfiguration, {
        maxEventsPerPage: Infinity,
        sentEventCount: 0,
    });
    onRawTelemetryEventCollected = function (event) {
        events.push(event);
    };
    return events;
}
exports.startFakeTelemetry = startFakeTelemetry;
function resetTelemetry() {
    onRawTelemetryEventCollected = undefined;
}
exports.resetTelemetry = resetTelemetry;
/**
 * Avoid mixing telemetry events from different data centers
 * but keep replicating staging events for reliability
 */
function isTelemetryReplicationAllowed(configuration) {
    return configuration.site === configuration_1.INTAKE_SITE_STAGING;
}
exports.isTelemetryReplicationAllowed = isTelemetryReplicationAllowed;
function addTelemetryDebug(message, context) {
    (0, monitor_1.displayIfDebugEnabled)(display_1.ConsoleApiName.debug, message, context);
    addTelemetry((0, utils_1.assign)({
        type: rawTelemetryEvent_types_1.TelemetryType.log,
        message: message,
        status: "debug" /* debug */,
    }, context));
}
exports.addTelemetryDebug = addTelemetryDebug;
function addTelemetryError(e) {
    addTelemetry((0, utils_1.assign)({
        type: rawTelemetryEvent_types_1.TelemetryType.log,
        status: "error" /* error */,
    }, formatError(e)));
}
exports.addTelemetryError = addTelemetryError;
function addTelemetryConfiguration(configuration) {
    if (telemetryConfiguration.telemetryConfigurationEnabled) {
        addTelemetry({
            type: rawTelemetryEvent_types_1.TelemetryType.configuration,
            configuration: configuration,
        });
    }
}
exports.addTelemetryConfiguration = addTelemetryConfiguration;
function addTelemetry(event) {
    if (onRawTelemetryEventCollected && telemetryConfiguration.sentEventCount < telemetryConfiguration.maxEventsPerPage) {
        telemetryConfiguration.sentEventCount += 1;
        onRawTelemetryEventCollected(event);
    }
}
function formatError(e) {
    if (e instanceof Error) {
        var stackTrace = (0, tracekit_1.computeStackTrace)(e);
        return {
            error: {
                kind: stackTrace.name,
                stack: (0, error_1.toStackTraceString)(scrubCustomerFrames(stackTrace)),
            },
            message: stackTrace.message,
        };
    }
    return {
        error: {
            stack: 'Not an instance of error',
        },
        message: "Uncaught ".concat((0, utils_1.jsonStringify)(e)),
    };
}
exports.formatError = formatError;
function scrubCustomerFrames(stackTrace) {
    stackTrace.stack = stackTrace.stack.filter(function (frame) { return !frame.url || ALLOWED_FRAME_URLS.some(function (allowedFrameUrl) { return (0, utils_1.startsWith)(frame.url, allowedFrameUrl); }); });
    return stackTrace;
}
exports.scrubCustomerFrames = scrubCustomerFrames;
//# sourceMappingURL=telemetry.js.map