"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRecorderApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var replayStats_1 = require("../domain/replayStats");
var segmentCollection_1 = require("../domain/segmentCollection");
function makeRecorderApi(startRecordingImpl, startDeflateWorkerImpl) {
    if (startDeflateWorkerImpl === void 0) { startDeflateWorkerImpl = segmentCollection_1.startDeflateWorker; }
    if ((0, browser_core_1.canUseEventBridge)() || !isBrowserSupported()) {
        return {
            start: browser_core_1.noop,
            stop: browser_core_1.noop,
            getReplayStats: function () { return undefined; },
            onRumStart: browser_core_1.noop,
            isRecording: function () { return false; },
        };
    }
    var state = {
        status: 0 /* Stopped */,
    };
    var startStrategy = function () {
        state = { status: 1 /* IntentToStart */ };
    };
    var stopStrategy = function () {
        state = { status: 0 /* Stopped */ };
    };
    return {
        start: function () { return startStrategy(); },
        stop: function () { return stopStrategy(); },
        getReplayStats: replayStats_1.getReplayStats,
        onRumStart: function (lifeCycle, configuration, sessionManager, viewContexts) {
            lifeCycle.subscribe(7 /* SESSION_EXPIRED */, function () {
                if (state.status === 2 /* Starting */ || state.status === 3 /* Started */) {
                    stopStrategy();
                    state = { status: 1 /* IntentToStart */ };
                }
            });
            lifeCycle.subscribe(8 /* SESSION_RENEWED */, function () {
                if (state.status === 1 /* IntentToStart */) {
                    startStrategy();
                }
            });
            startStrategy = function () {
                var session = sessionManager.findTrackedSession();
                if (!session || !session.sessionReplayAllowed) {
                    state = { status: 1 /* IntentToStart */ };
                    return;
                }
                if (state.status === 2 /* Starting */ || state.status === 3 /* Started */) {
                    return;
                }
                state = { status: 2 /* Starting */ };
                (0, browser_core_1.runOnReadyState)('interactive', function () {
                    if (state.status !== 2 /* Starting */) {
                        return;
                    }
                    startDeflateWorkerImpl(function (worker) {
                        if (state.status !== 2 /* Starting */) {
                            return;
                        }
                        if (!worker) {
                            state = {
                                status: 0 /* Stopped */,
                            };
                            return;
                        }
                        var stopRecording = startRecordingImpl(lifeCycle, configuration, sessionManager, viewContexts, worker).stop;
                        state = {
                            status: 3 /* Started */,
                            stopRecording: stopRecording,
                        };
                    });
                });
            };
            stopStrategy = function () {
                if (state.status === 0 /* Stopped */) {
                    return;
                }
                if (state.status === 3 /* Started */) {
                    state.stopRecording();
                }
                state = {
                    status: 0 /* Stopped */,
                };
            };
            if (state.status === 1 /* IntentToStart */) {
                startStrategy();
            }
        },
        isRecording: function () { return state.status === 3 /* Started */; },
    };
}
exports.makeRecorderApi = makeRecorderApi;
/**
 * Test for Browser features used while recording
 */
function isBrowserSupported() {
    return (
    // Array.from is a bit less supported by browsers than CSSSupportsRule, but has higher chances
    // to be polyfilled. Test for both to be more confident. We could add more things if we find out
    // this test is not sufficient.
    typeof Array.from === 'function' && typeof CSSSupportsRule === 'function');
}
//# sourceMappingURL=recorderApi.js.map