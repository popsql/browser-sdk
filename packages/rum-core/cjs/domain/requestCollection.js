"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFetch = exports.trackXhr = exports.startRequestCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var resourceUtils_1 = require("./rumEventsCollection/resource/resourceUtils");
var tracer_1 = require("./tracing/tracer");
var nextRequestIndex = 1;
function startRequestCollection(lifeCycle, configuration, sessionManager) {
    var tracer = (0, tracer_1.startTracer)(configuration, sessionManager);
    trackXhr(lifeCycle, configuration, tracer);
    trackFetch(lifeCycle, configuration, tracer);
}
exports.startRequestCollection = startRequestCollection;
function trackXhr(lifeCycle, configuration, tracer) {
    var subscription = (0, browser_core_1.initXhrObservable)().subscribe(function (rawContext) {
        var context = rawContext;
        if (!(0, resourceUtils_1.isAllowedRequestUrl)(configuration, context.url)) {
            return;
        }
        switch (context.state) {
            case 'start':
                tracer.traceXhr(context, context.xhr);
                context.requestIndex = getNextRequestIndex();
                lifeCycle.notify(5 /* REQUEST_STARTED */, {
                    requestIndex: context.requestIndex,
                    url: context.url,
                });
                break;
            case 'complete':
                tracer.clearTracingIfNeeded(context);
                lifeCycle.notify(6 /* REQUEST_COMPLETED */, {
                    duration: context.duration,
                    method: context.method,
                    requestIndex: context.requestIndex,
                    spanId: context.spanId,
                    startClocks: context.startClocks,
                    status: context.status,
                    traceId: context.traceId,
                    traceSampled: context.traceSampled,
                    type: "xhr" /* XHR */,
                    url: context.url,
                    xhr: context.xhr,
                });
                break;
        }
    });
    return { stop: function () { return subscription.unsubscribe(); } };
}
exports.trackXhr = trackXhr;
function trackFetch(lifeCycle, configuration, tracer) {
    var subscription = (0, browser_core_1.initFetchObservable)().subscribe(function (rawContext) {
        var context = rawContext;
        if (!(0, resourceUtils_1.isAllowedRequestUrl)(configuration, context.url)) {
            return;
        }
        switch (context.state) {
            case 'start':
                tracer.traceFetch(context);
                context.requestIndex = getNextRequestIndex();
                lifeCycle.notify(5 /* REQUEST_STARTED */, {
                    requestIndex: context.requestIndex,
                    url: context.url,
                });
                break;
            case 'complete':
                tracer.clearTracingIfNeeded(context);
                lifeCycle.notify(6 /* REQUEST_COMPLETED */, {
                    duration: context.duration,
                    method: context.method,
                    requestIndex: context.requestIndex,
                    responseType: context.responseType,
                    spanId: context.spanId,
                    startClocks: context.startClocks,
                    status: context.status,
                    traceId: context.traceId,
                    traceSampled: context.traceSampled,
                    type: "fetch" /* FETCH */,
                    url: context.url,
                    response: context.response,
                    init: context.init,
                    input: context.input,
                });
                break;
        }
    });
    return { stop: function () { return subscription.unsubscribe(); } };
}
exports.trackFetch = trackFetch;
function getNextRequestIndex() {
    var result = nextRequestIndex;
    nextRequestIndex += 1;
    return result;
}
//# sourceMappingURL=requestCollection.js.map