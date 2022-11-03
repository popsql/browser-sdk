import { noop, round, ONE_SECOND, elapsed } from '@datadog/browser-core';
import { supportPerformanceTimingEvent } from '../../../browser/performanceCollection';
import { trackEventCounts } from '../../trackEventCounts';
import { waitPageActivityEnd } from '../../waitPageActivityEnd';
export function trackViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, viewStart) {
    var viewMetrics = {
        eventCounts: {
            errorCount: 0,
            longTaskCount: 0,
            resourceCount: 0,
            actionCount: 0,
            frustrationCount: 0,
        },
    };
    var stopEventCountsTracking = trackEventCounts(lifeCycle, function (newEventCounts) {
        viewMetrics.eventCounts = newEventCounts;
        scheduleViewUpdate();
    }).stop;
    var _a = trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadingType, viewStart, function (newLoadingTime) {
        viewMetrics.loadingTime = newLoadingTime;
        scheduleViewUpdate();
    }), stopLoadingTimeTracking = _a.stop, setLoadEvent = _a.setLoadEvent;
    var stopCLSTracking;
    if (isLayoutShiftSupported()) {
        viewMetrics.cumulativeLayoutShift = 0;
        (stopCLSTracking = trackCumulativeLayoutShift(lifeCycle, function (cumulativeLayoutShift) {
            viewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
            scheduleViewUpdate();
        }).stop);
    }
    else {
        stopCLSTracking = noop;
    }
    return {
        stop: function () {
            stopEventCountsTracking();
            stopLoadingTimeTracking();
            stopCLSTracking();
        },
        setLoadEvent: setLoadEvent,
        viewMetrics: viewMetrics,
    };
}
function trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadType, viewStart, callback) {
    var isWaitingForLoadEvent = loadType === "initial_load" /* INITIAL_LOAD */;
    var isWaitingForActivityLoadingTime = true;
    var loadingTimeCandidates = [];
    function invokeCallbackIfAllCandidatesAreReceived() {
        if (!isWaitingForActivityLoadingTime && !isWaitingForLoadEvent && loadingTimeCandidates.length > 0) {
            callback(Math.max.apply(Math, loadingTimeCandidates));
        }
    }
    var stop = waitPageActivityEnd(lifeCycle, domMutationObservable, configuration, function (event) {
        if (isWaitingForActivityLoadingTime) {
            isWaitingForActivityLoadingTime = false;
            if (event.hadActivity) {
                loadingTimeCandidates.push(elapsed(viewStart.timeStamp, event.end));
            }
            invokeCallbackIfAllCandidatesAreReceived();
        }
    }).stop;
    return {
        stop: stop,
        setLoadEvent: function (loadEvent) {
            if (isWaitingForLoadEvent) {
                isWaitingForLoadEvent = false;
                loadingTimeCandidates.push(loadEvent);
                invokeCallbackIfAllCandidatesAreReceived();
            }
        },
    };
}
/**
 * Track the cumulative layout shifts (CLS).
 * Layout shifts are grouped into session windows.
 * The minimum gap between session windows is 1 second.
 * The maximum duration of a session window is 5 second.
 * The session window layout shift value is the sum of layout shifts inside it.
 * The CLS value is the max of session windows values.
 *
 * This yields a new value whenever the CLS value is updated (a higher session window value is computed).
 *
 * See isLayoutShiftSupported to check for browser support.
 *
 * Documentation:
 * https://web.dev/cls/
 * https://web.dev/evolving-cls/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getCLS.ts
 */
function trackCumulativeLayoutShift(lifeCycle, callback) {
    var maxClsValue = 0;
    var window = slidingSessionWindow();
    var stop = lifeCycle.subscribe(0 /* PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                window.update(entry);
                if (window.value() > maxClsValue) {
                    maxClsValue = window.value();
                    callback(round(maxClsValue, 4));
                }
            }
        }
    }).unsubscribe;
    return {
        stop: stop,
    };
}
function slidingSessionWindow() {
    var value = 0;
    var startTime;
    var endTime;
    return {
        update: function (entry) {
            var shouldCreateNewWindow = startTime === undefined ||
                entry.startTime - endTime >= ONE_SECOND ||
                entry.startTime - startTime >= 5 * ONE_SECOND;
            if (shouldCreateNewWindow) {
                startTime = endTime = entry.startTime;
                value = entry.value;
            }
            else {
                value += entry.value;
                endTime = entry.startTime;
            }
        },
        value: function () { return value; },
    };
}
/**
 * Check whether `layout-shift` is supported by the browser.
 */
function isLayoutShiftSupported() {
    return supportPerformanceTimingEvent('layout-shift');
}
//# sourceMappingURL=trackViewMetrics.js.map