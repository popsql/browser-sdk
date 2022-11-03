import { combine, generateUUID, toServerDuration, relativeToClocks, assign, isNumber, } from '@datadog/browser-core';
import { matchRequestTiming } from './matchRequestTiming';
import { computePerformanceResourceDetails, computePerformanceResourceDuration, computeResourceKind, computeSize, isRequestKind, } from './resourceUtils';
export function startResourceCollection(lifeCycle, configuration, sessionManager) {
    lifeCycle.subscribe(6 /* REQUEST_COMPLETED */, function (request) {
        lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processRequest(request, configuration, sessionManager));
    });
    lifeCycle.subscribe(0 /* PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'resource' && !isRequestKind(entry)) {
                lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processResourceEntry(entry, configuration, sessionManager));
            }
        }
    });
}
function processRequest(request, configuration, sessionManager) {
    var type = request.type === "xhr" /* XHR */ ? "xhr" /* XHR */ : "fetch" /* FETCH */;
    var matchingTiming = matchRequestTiming(request);
    var startClocks = matchingTiming ? relativeToClocks(matchingTiming.startTime) : request.startClocks;
    var correspondingTimingOverrides = matchingTiming ? computePerformanceEntryMetrics(matchingTiming) : undefined;
    var tracingInfo = computeRequestTracingInfo(request, configuration);
    var indexingInfo = computeIndexingInfo(sessionManager, startClocks);
    var resourceEvent = combine({
        date: startClocks.timeStamp,
        resource: {
            id: generateUUID(),
            type: type,
            duration: toServerDuration(request.duration),
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
    var type = computeResourceKind(entry);
    var entryMetrics = computePerformanceEntryMetrics(entry);
    var startClocks = relativeToClocks(entry.startTime);
    var tracingInfo = computeEntryTracingInfo(entry, configuration);
    var indexingInfo = computeIndexingInfo(sessionManager, startClocks);
    var resourceEvent = combine({
        date: startClocks.timeStamp,
        resource: {
            id: generateUUID(),
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
        resource: assign({
            duration: computePerformanceResourceDuration(timing),
            size: computeSize(timing),
        }, computePerformanceResourceDetails(timing)),
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
    return isNumber(configuration.tracingSampleRate) ? configuration.tracingSampleRate / 100 : undefined;
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