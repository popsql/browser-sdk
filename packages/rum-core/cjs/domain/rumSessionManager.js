"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumSessionManagerStub = exports.startRumSessionManager = exports.RUM_SESSION_KEY = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.RUM_SESSION_KEY = 'rum';
function startRumSessionManager(configuration, lifeCycle) {
    var sessionManager = (0, browser_core_1.startSessionManager)(configuration.cookieOptions, exports.RUM_SESSION_KEY, function (rawTrackingType) {
        return computeSessionState(configuration, rawTrackingType);
    });
    sessionManager.expireObservable.subscribe(function () {
        lifeCycle.notify(7 /* SESSION_EXPIRED */);
    });
    sessionManager.renewObservable.subscribe(function () {
        lifeCycle.notify(8 /* SESSION_RENEWED */);
    });
    return {
        findTrackedSession: function (startTime) {
            var session = sessionManager.findActiveSession(startTime);
            if (!session || !isTypeTracked(session.trackingType)) {
                return;
            }
            var plan = session.trackingType === "1" /* TRACKED_WITH_SESSION_REPLAY */
                ? 2 /* WITH_SESSION_REPLAY */
                : 1 /* WITHOUT_SESSION_REPLAY */;
            return {
                id: session.id,
                plan: plan,
                sessionReplayAllowed: plan === 2 /* WITH_SESSION_REPLAY */,
                longTaskAllowed: configuration.trackLongTasks !== undefined
                    ? configuration.trackLongTasks
                    : configuration.oldPlansBehavior && plan === 2 /* WITH_SESSION_REPLAY */,
                resourceAllowed: configuration.trackResources !== undefined
                    ? configuration.trackResources
                    : configuration.oldPlansBehavior && plan === 2 /* WITH_SESSION_REPLAY */,
            };
        },
    };
}
exports.startRumSessionManager = startRumSessionManager;
/**
 * Start a tracked replay session stub
 */
function startRumSessionManagerStub() {
    var session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        plan: 1 /* WITHOUT_SESSION_REPLAY */,
        sessionReplayAllowed: false,
        longTaskAllowed: true,
        resourceAllowed: true,
    };
    return {
        findTrackedSession: function () { return session; },
    };
}
exports.startRumSessionManagerStub = startRumSessionManagerStub;
function computeSessionState(configuration, rawTrackingType) {
    var trackingType;
    if (hasValidRumSession(rawTrackingType)) {
        trackingType = rawTrackingType;
    }
    else if (!(0, browser_core_1.performDraw)(configuration.sampleRate)) {
        trackingType = "0" /* NOT_TRACKED */;
    }
    else if (!(0, browser_core_1.performDraw)(configuration.sessionReplaySampleRate)) {
        trackingType = "2" /* TRACKED_WITHOUT_SESSION_REPLAY */;
    }
    else {
        trackingType = "1" /* TRACKED_WITH_SESSION_REPLAY */;
    }
    return {
        trackingType: trackingType,
        isTracked: isTypeTracked(trackingType),
    };
}
function hasValidRumSession(trackingType) {
    return (trackingType === "0" /* NOT_TRACKED */ ||
        trackingType === "1" /* TRACKED_WITH_SESSION_REPLAY */ ||
        trackingType === "2" /* TRACKED_WITHOUT_SESSION_REPLAY */);
}
function isTypeTracked(rumSessionType) {
    return (rumSessionType === "2" /* TRACKED_WITHOUT_SESSION_REPLAY */ ||
        rumSessionType === "1" /* TRACKED_WITH_SESSION_REPLAY */);
}
//# sourceMappingURL=rumSessionManager.js.map