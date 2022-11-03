import { initFetchObservable, initXhrObservable } from '@datadog/browser-core';
import { isAllowedRequestUrl } from './rumEventsCollection/resource/resourceUtils';
import { startTracer } from './tracing/tracer';
var nextRequestIndex = 1;
export function startRequestCollection(lifeCycle, configuration, sessionManager) {
    var tracer = startTracer(configuration, sessionManager);
    trackXhr(lifeCycle, configuration, tracer);
    trackFetch(lifeCycle, configuration, tracer);
}
export function trackXhr(lifeCycle, configuration, tracer) {
    var subscription = initXhrObservable().subscribe(function (rawContext) {
        var context = rawContext;
        if (!isAllowedRequestUrl(configuration, context.url)) {
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
export function trackFetch(lifeCycle, configuration, tracer) {
    var subscription = initFetchObservable().subscribe(function (rawContext) {
        var context = rawContext;
        if (!isAllowedRequestUrl(configuration, context.url)) {
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
function getNextRequestIndex() {
    var result = nextRequestIndex;
    nextRequestIndex += 1;
    return result;
}
//# sourceMappingURL=requestCollection.js.map