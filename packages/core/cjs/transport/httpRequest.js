"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendXHR = exports.fetchKeepAliveStrategy = exports.createHttpRequest = void 0;
var telemetry_1 = require("../domain/telemetry");
var monitor_1 = require("../tools/monitor");
var sendWithRetryStrategy_1 = require("./sendWithRetryStrategy");
function createHttpRequest(endpointBuilder, bytesLimit, reportError) {
    var retryState = (0, sendWithRetryStrategy_1.newRetryState)();
    var sendStrategyForRetry = function (payload, onResponse) {
        return fetchKeepAliveStrategy(endpointBuilder, bytesLimit, payload, onResponse);
    };
    return {
        send: function (payload) {
            (0, sendWithRetryStrategy_1.sendWithRetryStrategy)(payload, retryState, sendStrategyForRetry, endpointBuilder.endpointType, reportError);
        },
        /**
         * Since fetch keepalive behaves like regular fetch on Firefox,
         * keep using sendBeaconStrategy on exit
         */
        sendOnExit: function (payload) {
            sendBeaconStrategy(endpointBuilder, bytesLimit, payload);
        },
    };
}
exports.createHttpRequest = createHttpRequest;
function sendBeaconStrategy(endpointBuilder, bytesLimit, _a) {
    var data = _a.data, bytesCount = _a.bytesCount;
    var url = endpointBuilder.build();
    var canUseBeacon = !!navigator.sendBeacon && bytesCount < bytesLimit;
    if (canUseBeacon) {
        try {
            var isQueued = navigator.sendBeacon(url, data);
            if (isQueued) {
                return;
            }
        }
        catch (e) {
            reportBeaconError(e);
        }
    }
    sendXHR(url, data);
}
var hasReportedBeaconError = false;
function reportBeaconError(e) {
    if (!hasReportedBeaconError) {
        hasReportedBeaconError = true;
        (0, telemetry_1.addTelemetryError)(e);
    }
}
function fetchKeepAliveStrategy(endpointBuilder, bytesLimit, _a, onResponse) {
    var data = _a.data, bytesCount = _a.bytesCount;
    var url = endpointBuilder.build();
    var canUseKeepAlive = isKeepAliveSupported() && bytesCount < bytesLimit;
    if (canUseKeepAlive) {
        fetch(url, { method: 'POST', body: data, keepalive: true }).then((0, monitor_1.monitor)(function (response) { return onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: response.status }); }), (0, monitor_1.monitor)(function () {
            // failed to queue the request
            sendXHR(url, data, onResponse);
        }));
    }
    else {
        sendXHR(url, data, onResponse);
    }
}
exports.fetchKeepAliveStrategy = fetchKeepAliveStrategy;
function isKeepAliveSupported() {
    // Request can throw, cf https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#errors
    try {
        return window.Request && 'keepalive' in new Request('http://a');
    }
    catch (_a) {
        return false;
    }
}
function sendXHR(url, data, onResponse) {
    var request = new XMLHttpRequest();
    var onLoadEnd = (0, monitor_1.monitor)(function () {
        // prevent multiple onResponse callbacks
        // if the xhr instance is reused by a third party
        request.removeEventListener('loadend', onLoadEnd);
        onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: request.status });
    });
    request.open('POST', url, true);
    request.addEventListener('loadend', onLoadEnd);
    request.send(data);
}
exports.sendXHR = sendXHR;
//# sourceMappingURL=httpRequest.js.map