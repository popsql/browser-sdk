import { shallowClone, assign, elapsed, generateUUID, monitor, ONE_MINUTE, throttle, clocksNow, clocksOrigin, timeStampNow, display, looksLikeRelativeTime, } from '@datadog/browser-core';
import { trackInitialViewTimings } from './trackInitialViewTimings';
import { trackViewMetrics } from './trackViewMetrics';
export var THROTTLE_VIEW_UPDATE_PERIOD = 3000;
export var SESSION_KEEP_ALIVE_INTERVAL = 5 * ONE_MINUTE;
export function trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, areViewsTrackedAutomatically, initialViewOptions) {
    var _a = trackInitialView(initialViewOptions), stopInitialViewTracking = _a.stop, initialView = _a.initialView;
    var currentView = initialView;
    var stopViewLifeCycle = startViewLifeCycle().stop;
    var locationChangeSubscription;
    if (areViewsTrackedAutomatically) {
        locationChangeSubscription = renewViewOnLocationChange(locationChangeObservable);
    }
    function trackInitialView(options) {
        var initialView = newView(lifeCycle, domMutationObservable, configuration, location, "initial_load" /* INITIAL_LOAD */, clocksOrigin(), options);
        var stop = trackInitialViewTimings(lifeCycle, function (timings) {
            initialView.updateTimings(timings);
            initialView.scheduleUpdate();
        }).stop;
        return { initialView: initialView, stop: stop };
    }
    function trackViewChange(startClocks, viewOptions) {
        return newView(lifeCycle, domMutationObservable, configuration, location, "route_change" /* ROUTE_CHANGE */, startClocks, viewOptions);
    }
    function startViewLifeCycle() {
        lifeCycle.subscribe(8 /* SESSION_RENEWED */, function () {
            // do not trigger view update to avoid wrong data
            currentView.end();
            // Renew view on session renewal
            currentView = trackViewChange(undefined, {
                name: currentView.name,
                service: currentView.service,
                version: currentView.version,
            });
        });
        // End the current view on page unload
        lifeCycle.subscribe(9 /* BEFORE_UNLOAD */, function () {
            currentView.end();
            currentView.triggerUpdate();
        });
        // Session keep alive
        var keepAliveInterval = window.setInterval(monitor(function () {
            currentView.triggerUpdate();
        }), SESSION_KEEP_ALIVE_INTERVAL);
        return {
            stop: function () {
                clearInterval(keepAliveInterval);
            },
        };
    }
    function renewViewOnLocationChange(locationChangeObservable) {
        return locationChangeObservable.subscribe(function (_a) {
            var oldLocation = _a.oldLocation, newLocation = _a.newLocation;
            if (areDifferentLocation(oldLocation, newLocation)) {
                currentView.end();
                currentView.triggerUpdate();
                currentView = trackViewChange();
                return;
            }
        });
    }
    return {
        addTiming: function (name, time) {
            if (time === void 0) { time = timeStampNow(); }
            currentView.addTiming(name, time);
            currentView.scheduleUpdate();
        },
        startView: function (options, startClocks) {
            currentView.end(startClocks);
            currentView.triggerUpdate();
            currentView = trackViewChange(startClocks, options);
        },
        stop: function () {
            locationChangeSubscription === null || locationChangeSubscription === void 0 ? void 0 : locationChangeSubscription.unsubscribe();
            stopInitialViewTracking();
            stopViewLifeCycle();
            currentView.end();
        },
    };
}
function newView(lifeCycle, domMutationObservable, configuration, initialLocation, loadingType, startClocks, viewOptions) {
    if (startClocks === void 0) { startClocks = clocksNow(); }
    // Setup initial values
    var id = generateUUID();
    var timings = {};
    var customTimings = {};
    var documentVersion = 0;
    var endClocks;
    var location = shallowClone(initialLocation);
    var name;
    var service;
    var version;
    if (viewOptions) {
        name = viewOptions.name;
        service = viewOptions.service;
        version = viewOptions.version;
    }
    lifeCycle.notify(2 /* VIEW_CREATED */, { id: id, name: name, startClocks: startClocks, service: service, version: version });
    // Update the view every time the measures are changing
    var _a = throttle(monitor(triggerViewUpdate), THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    }), scheduleViewUpdate = _a.throttled, cancelScheduleViewUpdate = _a.cancel;
    var _b = trackViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, startClocks), setLoadEvent = _b.setLoadEvent, stopViewMetricsTracking = _b.stop, viewMetrics = _b.viewMetrics;
    // Initial view update
    triggerViewUpdate();
    function triggerViewUpdate() {
        documentVersion += 1;
        var currentEnd = endClocks === undefined ? timeStampNow() : endClocks.timeStamp;
        lifeCycle.notify(3 /* VIEW_UPDATED */, assign({
            customTimings: customTimings,
            documentVersion: documentVersion,
            id: id,
            name: name,
            service: service,
            version: version,
            loadingType: loadingType,
            location: location,
            startClocks: startClocks,
            timings: timings,
            duration: elapsed(startClocks.timeStamp, currentEnd),
            isActive: endClocks === undefined,
        }, viewMetrics));
    }
    return {
        name: name,
        service: service,
        version: version,
        scheduleUpdate: scheduleViewUpdate,
        end: function (clocks) {
            if (clocks === void 0) { clocks = clocksNow(); }
            endClocks = clocks;
            lifeCycle.notify(4 /* VIEW_ENDED */, { endClocks: endClocks });
            stopViewMetricsTracking();
        },
        triggerUpdate: function () {
            // cancel any pending view updates execution
            cancelScheduleViewUpdate();
            triggerViewUpdate();
        },
        updateTimings: function (newTimings) {
            timings = newTimings;
            if (newTimings.loadEvent !== undefined) {
                setLoadEvent(newTimings.loadEvent);
            }
        },
        addTiming: function (name, time) {
            var relativeTime = looksLikeRelativeTime(time) ? time : elapsed(startClocks.timeStamp, time);
            customTimings[sanitizeTiming(name)] = relativeTime;
        },
    };
}
/**
 * Timing name is used as facet path that must contain only letters, digits, or the characters - _ . @ $
 */
function sanitizeTiming(name) {
    var sanitized = name.replace(/[^a-zA-Z0-9-_.@$]/g, '_');
    if (sanitized !== name) {
        display.warn("Invalid timing name: ".concat(name, ", sanitized to: ").concat(sanitized));
    }
    return sanitized;
}
function areDifferentLocation(currentLocation, otherLocation) {
    return (currentLocation.pathname !== otherLocation.pathname ||
        (!isHashAnAnchor(otherLocation.hash) &&
            getPathFromHash(otherLocation.hash) !== getPathFromHash(currentLocation.hash)));
}
function isHashAnAnchor(hash) {
    var correspondingId = hash.substr(1);
    return !!document.getElementById(correspondingId);
}
function getPathFromHash(hash) {
    var index = hash.indexOf('?');
    return index < 0 ? hash : hash.slice(0, index);
}
//# sourceMappingURL=trackViews.js.map