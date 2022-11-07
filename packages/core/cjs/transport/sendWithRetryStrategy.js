"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRetryState = exports.sendWithRetryStrategy = exports.INITIAL_BACKOFF_TIME = exports.MAX_BACKOFF_TIME = exports.MAX_QUEUE_BYTES_COUNT = exports.MAX_ONGOING_REQUESTS = exports.MAX_ONGOING_BYTES_COUNT = void 0;
var monitor_1 = require("../tools/monitor");
var timeUtils_1 = require("../tools/timeUtils");
var utils_1 = require("../tools/utils");
var error_1 = require("../tools/error");
exports.MAX_ONGOING_BYTES_COUNT = 80 * utils_1.ONE_KIBI_BYTE;
exports.MAX_ONGOING_REQUESTS = 32;
exports.MAX_QUEUE_BYTES_COUNT = 3 * utils_1.ONE_MEBI_BYTE;
exports.MAX_BACKOFF_TIME = utils_1.ONE_MINUTE;
exports.INITIAL_BACKOFF_TIME = utils_1.ONE_SECOND;
function sendWithRetryStrategy(payload, state, sendStrategy, endpointType, reportError) {
    if (state.transportStatus === 0 /* UP */ &&
        state.queuedPayloads.size() === 0 &&
        state.bandwidthMonitor.canHandle(payload)) {
        send(payload, state, sendStrategy, {
            onSuccess: function () { return retryQueuedPayloads(0 /* AFTER_SUCCESS */, state, sendStrategy, endpointType, reportError); },
            onFailure: function () {
                state.queuedPayloads.enqueue(payload);
                scheduleRetry(state, sendStrategy, endpointType, reportError);
            },
        });
    }
    else {
        state.queuedPayloads.enqueue(payload);
    }
}
exports.sendWithRetryStrategy = sendWithRetryStrategy;
function scheduleRetry(state, sendStrategy, endpointType, reportError) {
    if (state.transportStatus !== 2 /* DOWN */) {
        return;
    }
    setTimeout((0, monitor_1.monitor)(function () {
        var payload = state.queuedPayloads.first();
        send(payload, state, sendStrategy, {
            onSuccess: function () {
                state.queuedPayloads.dequeue();
                state.currentBackoffTime = exports.INITIAL_BACKOFF_TIME;
                retryQueuedPayloads(1 /* AFTER_RESUME */, state, sendStrategy, endpointType, reportError);
            },
            onFailure: function () {
                state.currentBackoffTime = Math.min(exports.MAX_BACKOFF_TIME, state.currentBackoffTime * 2);
                scheduleRetry(state, sendStrategy, endpointType, reportError);
            },
        });
    }), state.currentBackoffTime);
}
function send(payload, state, sendStrategy, _a) {
    var onSuccess = _a.onSuccess, onFailure = _a.onFailure;
    state.bandwidthMonitor.add(payload);
    sendStrategy(payload, function (response) {
        state.bandwidthMonitor.remove(payload);
        if (!shouldRetryRequest(response)) {
            state.transportStatus = 0 /* UP */;
            onSuccess();
        }
        else {
            // do not consider transport down if another ongoing request could succeed
            state.transportStatus =
                state.bandwidthMonitor.ongoingRequestCount > 0 ? 1 /* FAILURE_DETECTED */ : 2 /* DOWN */;
            onFailure();
        }
    });
}
function retryQueuedPayloads(reason, state, sendStrategy, endpointType, reportError) {
    if (reason === 0 /* AFTER_SUCCESS */ && state.queuedPayloads.isFull() && !state.queueFullReported) {
        reportError({
            message: "Reached max ".concat(endpointType, " events size queued for upload: ").concat(exports.MAX_QUEUE_BYTES_COUNT / utils_1.ONE_MEBI_BYTE, "MiB"),
            source: error_1.ErrorSource.AGENT,
            startClocks: (0, timeUtils_1.clocksNow)(),
        });
        state.queueFullReported = true;
    }
    var previousQueue = state.queuedPayloads;
    state.queuedPayloads = newPayloadQueue();
    while (previousQueue.size() > 0) {
        sendWithRetryStrategy(previousQueue.dequeue(), state, sendStrategy, endpointType, reportError);
    }
}
function shouldRetryRequest(response) {
    return response.status === 0 || response.status === 408 || response.status === 429 || response.status >= 500;
}
function newRetryState() {
    return {
        transportStatus: 0 /* UP */,
        currentBackoffTime: exports.INITIAL_BACKOFF_TIME,
        bandwidthMonitor: newBandwidthMonitor(),
        queuedPayloads: newPayloadQueue(),
        queueFullReported: false,
    };
}
exports.newRetryState = newRetryState;
function newPayloadQueue() {
    var queue = [];
    return {
        bytesCount: 0,
        enqueue: function (payload) {
            if (this.isFull()) {
                return;
            }
            queue.push(payload);
            this.bytesCount += payload.bytesCount;
        },
        first: function () {
            return queue[0];
        },
        dequeue: function () {
            var payload = queue.shift();
            if (payload) {
                this.bytesCount -= payload.bytesCount;
            }
            return payload;
        },
        size: function () {
            return queue.length;
        },
        isFull: function () {
            return this.bytesCount >= exports.MAX_QUEUE_BYTES_COUNT;
        },
    };
}
function newBandwidthMonitor() {
    return {
        ongoingRequestCount: 0,
        ongoingByteCount: 0,
        canHandle: function (payload) {
            return (this.ongoingRequestCount === 0 ||
                (this.ongoingByteCount + payload.bytesCount <= exports.MAX_ONGOING_BYTES_COUNT &&
                    this.ongoingRequestCount < exports.MAX_ONGOING_REQUESTS));
        },
        add: function (payload) {
            this.ongoingRequestCount += 1;
            this.ongoingByteCount += payload.bytesCount;
        },
        remove: function (payload) {
            this.ongoingRequestCount -= 1;
            this.ongoingByteCount -= payload.bytesCount;
        },
    };
}
//# sourceMappingURL=sendWithRetryStrategy.js.map