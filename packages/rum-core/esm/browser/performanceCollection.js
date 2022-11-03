import { dateNow, assign, addEventListeners, getRelativeTime, isNumber, monitor, relativeNow, runOnReadyState, } from '@datadog/browser-core';
import { FAKE_INITIAL_DOCUMENT, isAllowedRequestUrl } from '../domain/rumEventsCollection/resource/resourceUtils';
import { getDocumentTraceId } from '../domain/tracing/getDocumentTraceId';
function supportPerformanceObject() {
    return window.performance !== undefined && 'getEntries' in performance;
}
export function supportPerformanceTimingEvent(entryType) {
    return (window.PerformanceObserver &&
        PerformanceObserver.supportedEntryTypes !== undefined &&
        PerformanceObserver.supportedEntryTypes.includes(entryType));
}
export function startPerformanceCollection(lifeCycle, configuration) {
    retrieveInitialDocumentResourceTiming(function (timing) {
        handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
    });
    if (supportPerformanceObject()) {
        var performanceEntries_1 = performance.getEntries();
        // Because the performance entry list can be quite large
        // delay the computation to prevent the SDK from blocking the main thread on init
        setTimeout(monitor(function () { return handleRumPerformanceEntries(lifeCycle, configuration, performanceEntries_1); }));
    }
    if (window.PerformanceObserver) {
        var handlePerformanceEntryList_1 = monitor(function (entries) {
            return handleRumPerformanceEntries(lifeCycle, configuration, entries.getEntries());
        });
        var mainEntries = ['resource', 'navigation', 'longtask', 'paint'];
        var experimentalEntries = ['largest-contentful-paint', 'first-input', 'layout-shift'];
        try {
            // Experimental entries are not retrieved by performance.getEntries()
            // use a single PerformanceObserver with buffered flag by type
            // to get values that could happen before SDK init
            experimentalEntries.forEach(function (type) {
                var observer = new PerformanceObserver(handlePerformanceEntryList_1);
                observer.observe({ type: type, buffered: true });
            });
        }
        catch (e) {
            // Some old browser versions (ex: chrome 67) don't support the PerformanceObserver type and buffered options
            // In these cases, fallback to PerformanceObserver with entryTypes
            mainEntries.push.apply(mainEntries, experimentalEntries);
        }
        var mainObserver = new PerformanceObserver(handlePerformanceEntryList_1);
        mainObserver.observe({ entryTypes: mainEntries });
        if (supportPerformanceObject() && 'addEventListener' in performance) {
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1559377
            performance.addEventListener('resourcetimingbufferfull', function () {
                performance.clearResourceTimings();
            });
        }
    }
    if (!supportPerformanceTimingEvent('navigation')) {
        retrieveNavigationTiming(function (timing) {
            handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
        });
    }
    if (!supportPerformanceTimingEvent('first-input')) {
        retrieveFirstInputTiming(function (timing) {
            handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
        });
    }
}
export function retrieveInitialDocumentResourceTiming(callback) {
    runOnReadyState('interactive', function () {
        var timing;
        var forcedAttributes = {
            entryType: 'resource',
            initiatorType: FAKE_INITIAL_DOCUMENT,
            traceId: getDocumentTraceId(document),
        };
        if (supportPerformanceTimingEvent('navigation') && performance.getEntriesByType('navigation').length > 0) {
            var navigationEntry = performance.getEntriesByType('navigation')[0];
            timing = assign(navigationEntry.toJSON(), forcedAttributes);
        }
        else {
            var relativePerformanceTiming = computeRelativePerformanceTiming();
            timing = assign(relativePerformanceTiming, {
                decodedBodySize: 0,
                duration: relativePerformanceTiming.responseEnd,
                name: window.location.href,
                startTime: 0,
            }, forcedAttributes);
        }
        callback(timing);
    });
}
function retrieveNavigationTiming(callback) {
    function sendFakeTiming() {
        callback(assign(computeRelativePerformanceTiming(), {
            entryType: 'navigation',
        }));
    }
    runOnReadyState('complete', function () {
        // Send it a bit after the actual load event, so the "loadEventEnd" timing is accurate
        setTimeout(monitor(sendFakeTiming));
    });
}
/**
 * first-input timing entry polyfill based on
 * https://github.com/GoogleChrome/web-vitals/blob/master/src/lib/polyfills/firstInputPolyfill.ts
 */
function retrieveFirstInputTiming(callback) {
    var startTimeStamp = dateNow();
    var timingSent = false;
    var removeEventListeners = addEventListeners(window, ["click" /* CLICK */, "mousedown" /* MOUSE_DOWN */, "keydown" /* KEY_DOWN */, "touchstart" /* TOUCH_START */, "pointerdown" /* POINTER_DOWN */], function (evt) {
        // Only count cancelable events, which should trigger behavior important to the user.
        if (!evt.cancelable) {
            return;
        }
        // This timing will be used to compute the "first Input delay", which is the delta between
        // when the system received the event (e.g. evt.timeStamp) and when it could run the callback
        // (e.g. performance.now()).
        var timing = {
            entryType: 'first-input',
            processingStart: relativeNow(),
            startTime: evt.timeStamp,
        };
        if (evt.type === "pointerdown" /* POINTER_DOWN */) {
            sendTimingIfPointerIsNotCancelled(timing);
        }
        else {
            sendTiming(timing);
        }
    }, { passive: true, capture: true }).stop;
    /**
     * Pointer events are a special case, because they can trigger main or compositor thread behavior.
     * We differentiate these cases based on whether or not we see a pointercancel event, which are
     * fired when we scroll. If we're scrolling we don't need to report input delay since FID excludes
     * scrolling and pinch/zooming.
     */
    function sendTimingIfPointerIsNotCancelled(timing) {
        addEventListeners(window, ["pointerup" /* POINTER_UP */, "pointercancel" /* POINTER_CANCEL */], function (event) {
            if (event.type === "pointerup" /* POINTER_UP */) {
                sendTiming(timing);
            }
        }, { once: true });
    }
    function sendTiming(timing) {
        if (!timingSent) {
            timingSent = true;
            removeEventListeners();
            // In some cases the recorded delay is clearly wrong, e.g. it's negative or it's larger than
            // the time between now and when the page was loaded.
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/6
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/7
            var delay = timing.processingStart - timing.startTime;
            if (delay >= 0 && delay < dateNow() - startTimeStamp) {
                callback(timing);
            }
        }
    }
}
function computeRelativePerformanceTiming() {
    var result = {};
    var timing = performance.timing;
    for (var key in timing) {
        if (isNumber(timing[key])) {
            var numberKey = key;
            var timingElement = timing[numberKey];
            result[numberKey] = timingElement === 0 ? 0 : getRelativeTime(timingElement);
        }
    }
    return result;
}
function handleRumPerformanceEntries(lifeCycle, configuration, entries) {
    var rumPerformanceEntries = entries.filter(function (entry) {
        return entry.entryType === 'resource' ||
            entry.entryType === 'navigation' ||
            entry.entryType === 'paint' ||
            entry.entryType === 'longtask' ||
            entry.entryType === 'largest-contentful-paint' ||
            entry.entryType === 'first-input' ||
            entry.entryType === 'layout-shift';
    });
    var rumAllowedPerformanceEntries = rumPerformanceEntries.filter(function (entry) { return !isIncompleteNavigation(entry) && !isForbiddenResource(configuration, entry); });
    if (rumAllowedPerformanceEntries.length) {
        lifeCycle.notify(0 /* PERFORMANCE_ENTRIES_COLLECTED */, rumAllowedPerformanceEntries);
    }
}
function isIncompleteNavigation(entry) {
    return entry.entryType === 'navigation' && entry.loadEventEnd <= 0;
}
function isForbiddenResource(configuration, entry) {
    return entry.entryType === 'resource' && !isAllowedRequestUrl(configuration, entry.name);
}
//# sourceMappingURL=performanceCollection.js.map