import { addEventListeners } from '@datadog/browser-core';
var trackFirstHiddenSingleton;
var stopListeners;
export function trackFirstHidden(emitter) {
    if (emitter === void 0) { emitter = window; }
    if (!trackFirstHiddenSingleton) {
        if (document.visibilityState === 'hidden') {
            trackFirstHiddenSingleton = {
                timeStamp: 0,
            };
        }
        else {
            trackFirstHiddenSingleton = {
                timeStamp: Infinity,
            };
            (stopListeners = addEventListeners(emitter, ["pagehide" /* PAGE_HIDE */, "visibilitychange" /* VISIBILITY_CHANGE */], function (event) {
                if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
                    trackFirstHiddenSingleton.timeStamp = event.timeStamp;
                    stopListeners();
                }
            }, { capture: true }).stop);
        }
    }
    return trackFirstHiddenSingleton;
}
export function resetFirstHidden() {
    if (stopListeners) {
        stopListeners();
    }
    trackFirstHiddenSingleton = undefined;
}
//# sourceMappingURL=trackFirstHidden.js.map