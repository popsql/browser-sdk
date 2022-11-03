"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startResourceCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var matchRequestTiming_1 = require("./matchRequestTiming");
var resourceUtils_1 = require("./resourceUtils");
function startResourceCollection(lifeCycle, configuration, sessionManager) {
    lifeCycle.subscribe(6 /* REQUEST_COMPLETED */, function (request) {
        lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processRequest(request, configuration, sessionManager));
    });
    lifeCycle.subscribe(0 /* PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'resource' && !(0, resourceUtils_1.isRequestKind)(entry)) {
                lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processResourceEntry(entry, configuration, sessionManager));
            }
        }
    });
}
exports.startResourceCollection = startResourceCollection;
function processRequest(request, configuration, sessionManager) {
    var type = request.type === "xhr" /* XHR */ ? "xhr" /* XHR */ : "fetch" /* FETCH */;
    var matchingTiming = (0, matchRequestTiming_1.matchRequestTiming)(request);
    var startClocks = matchingTiming ? (0, browser_core_1.relativeToClocks)(matchingTiming.startTime) : request.startClocks;
    var correspondingTimingOverrides = matchingTiming ? computePerformanceEntryMetrics(matchingTiming) : undefined;
    var tracingInfo = computeRequestTracingInfo(request, configuration);
    var indexingInfo = computeIndexingInfo(sessionManager, startClocks);
    var resourceEvent = (0, browser_core_1.combine)({
        date: startClocks.timeStamp,
        resource: {
            id: (0, browser_core_1.generateUUID)(),
            type: type,
            duration: (0, browser_core_1.toServerDuration)(request.duration),
            method: request.method,
            status_code: request.status,
            url: request.url,
        },
        type: "resource" /* RESOURCE */,
    }, tracingInfo, correspondingTimingOverrides, indexingInfo);
    return {
        startTime: startClocks.relative,
        rawRumEvent: resourceEvent,
        domainContext: {
            performanceEntry: matchingTiming && toPerformanceEntryRepresentation(matchingTiming),
            xhr: request.xhr,
            response: request.response,
            requestInput: request.input,
            requestInit: request.init,
            error: request.error,
        },
    };
}
function processResourceEntry(entry, configuration, sessionManager) {
    var type = (0, resourceUtils_1.computeResourceKind)(entry);
    var entryMetrics = computePerformanceEntryMetrics(entry);
    var startClocks = (0, browser_core_1.relativeToClocks)(entry.startTime);
    var tracingInfo = computeEntryTracingInfo(entry, configuration);
    var indexingInfo = computeIndexingInfo(sessionManager, startClocks);
    var resourceEvent = (0, browser_core_1.combine)({
        date: startClocks.timeStamp,
        resource: {
            id: (0, browser_core_1.generateUUID)(),
            type: type,
            url: entry.name,
        },
        type: "resource" /* RESOURCE */,
    }, tracingInfo, entryMetrics, indexingInfo);
    return {
        startTime: startClocks.relative,
        rawRumEvent: resourceEvent,
        domainContext: {
            performanceEntry: toPerformanceEntryRepresentation(entry),
        },
    };
}
function computePerformanceEntryMetrics(timing) {
    return {
        resource: (0, browser_core_1.assign)({
            duration: (0, resourceUtils_1.computePerformanceResourceDuration)(timing),
            size: (0, resourceUtils_1.computeSize)(timing),
        }, (0, resourceUtils_1.computePerformanceResourceDetails)(timing)),
    };
}
function computeRequestTracingInfo(request, configuration) {
    var hasBeenTraced = request.traceSampled && request.traceId && request.spanId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            span_id: request.spanId.toDecimalString(),
            trace_id: request.traceId.toDecimalString(),
            rule_psr: getRulePsr(configuration),
        },
    };
}
function computeEntryTracingInfo(entry, configuration) {
    var hasBeenTraced = entry.traceId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            trace_id: entry.traceId,
            rule_psr: getRulePsr(configuration),
        },
    };
}
// TODO next major: use directly PerformanceEntry type in domain context
function toPerformanceEntryRepresentation(entry) {
    return entry;
}
/**
 * @returns number between 0 and 1 which represents tracing sample rate
 */
function getRulePsr(configuration) {
    return (0, browser_core_1.isNumber)(configuration.tracingSampleRate) ? configuration.tracingSampleRate / 100 : undefined;
}
function computeIndexingInfo(sessionManager, resourceStart) {
    var session = sessionManager.findTrackedSession(resourceStart.relative);
    return {
        _dd: {
            discarded: !session || !session.resourceAllowed,
        },
    };
}
//# sourceMappingURL=resourceCollection.js.map