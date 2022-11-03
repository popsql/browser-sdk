import { getOrigin, matchList, objectEntries, shallowClone, performDraw, isNumber } from '@datadog/browser-core';
/**
 * Clear tracing information to avoid incomplete traces. Ideally, we should do it when the
 * request did not reach the server, but the browser does not expose this. So, we clear tracing
 * information if the request ended with status 0 without being aborted by the application.
 *
 * Reasoning:
 *
 * * Applications are usually aborting requests after a bit of time, for example when the user is
 * typing (autocompletion) or navigating away (in a SPA). With a performant device and good
 * network conditions, the request is likely to reach the server before being canceled.
 *
 * * Requests aborted otherwise (ex: lack of internet, CORS issue, blocked by a privacy extension)
 * are likely to finish quickly and without reaching the server.
 *
 * Of course, it might not be the case every time, but it should limit having incomplete traces a
 * bit.
 * */
export function clearTracingIfNeeded(context) {
    if (context.status === 0 && !context.isAborted) {
        context.traceId = undefined;
        context.spanId = undefined;
        context.traceSampled = undefined;
    }
}
export function startTracer(configuration, sessionManager) {
    return {
        clearTracingIfNeeded: clearTracingIfNeeded,
        traceFetch: function (context) {
            return injectHeadersIfTracingAllowed(configuration, context, sessionManager, function (tracingHeaders) {
                var _a;
                if (context.input instanceof Request && !((_a = context.init) === null || _a === void 0 ? void 0 : _a.headers)) {
                    context.input = new Request(context.input);
                    Object.keys(tracingHeaders).forEach(function (key) {
                        ;
                        context.input.headers.append(key, tracingHeaders[key]);
                    });
                }
                else {
                    context.init = shallowClone(context.init);
                    var headers_1 = [];
                    if (context.init.headers instanceof Headers) {
                        context.init.headers.forEach(function (value, key) {
                            headers_1.push([key, value]);
                        });
                    }
                    else if (Array.isArray(context.init.headers)) {
                        context.init.headers.forEach(function (header) {
                            headers_1.push(header);
                        });
                    }
                    else if (context.init.headers) {
                        Object.keys(context.init.headers).forEach(function (key) {
                            headers_1.push([key, context.init.headers[key]]);
                        });
                    }
                    context.init.headers = headers_1.concat(objectEntries(tracingHeaders));
                }
            });
        },
        traceXhr: function (context, xhr) {
            return injectHeadersIfTracingAllowed(configuration, context, sessionManager, function (tracingHeaders) {
                Object.keys(tracingHeaders).forEach(function (name) {
                    xhr.setRequestHeader(name, tracingHeaders[name]);
                });
            });
        },
    };
}
function injectHeadersIfTracingAllowed(configuration, context, sessionManager, inject) {
    if (!isTracingSupported() || !isAllowedUrl(configuration, context.url) || !sessionManager.findTrackedSession()) {
        return;
    }
    context.traceId = new TraceIdentifier();
    context.spanId = new TraceIdentifier();
    context.traceSampled = !isNumber(configuration.tracingSampleRate) || performDraw(configuration.tracingSampleRate);
    inject(makeTracingHeaders(context.traceId, context.spanId, context.traceSampled));
}
function isAllowedUrl(configuration, requestUrl) {
    return matchList(configuration.allowedTracingOrigins, getOrigin(requestUrl));
}
export function isTracingSupported() {
    return getCrypto() !== undefined;
}
function getCrypto() {
    return window.crypto || window.msCrypto;
}
/**
 * When trace is not sampled, set priority to '0' instead of not adding the tracing headers
 * to prepare the implementation for sampling delegation.
 */
function makeTracingHeaders(traceId, spanId, traceSampled) {
    return {
        'x-datadog-origin': 'rum',
        'x-datadog-parent-id': spanId.toDecimalString(),
        'x-datadog-sampling-priority': traceSampled ? '1' : '0',
        'x-datadog-trace-id': traceId.toDecimalString(),
    };
}
/* eslint-disable no-bitwise */
var TraceIdentifier = /** @class */ (function () {
    function TraceIdentifier() {
        this.buffer = new Uint8Array(8);
        getCrypto().getRandomValues(this.buffer);
        this.buffer[0] = this.buffer[0] & 0x7f; // force 63-bit
    }
    TraceIdentifier.prototype.toString = function (radix) {
        var high = this.readInt32(0);
        var low = this.readInt32(4);
        var str = '';
        do {
            var mod = (high % radix) * 4294967296 + low;
            high = Math.floor(high / radix);
            low = Math.floor(mod / radix);
            str = (mod % radix).toString(radix) + str;
        } while (high || low);
        return str;
    };
    /**
     * Format used everywhere except the trace intake
     */
    TraceIdentifier.prototype.toDecimalString = function () {
        return this.toString(10);
    };
    TraceIdentifier.prototype.readInt32 = function (offset) {
        return (this.buffer[offset] * 16777216 +
            (this.buffer[offset + 1] << 16) +
            (this.buffer[offset + 2] << 8) +
            this.buffer[offset + 3]);
    };
    return TraceIdentifier;
}());
export { TraceIdentifier };
/* eslint-enable no-bitwise */
//# sourceMappingURL=tracer.js.map