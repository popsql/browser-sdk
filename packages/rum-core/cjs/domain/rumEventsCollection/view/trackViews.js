"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViews = exports.SESSION_KEEP_ALIVE_INTERVAL = exports.THROTTLE_VIEW_UPDATE_PERIOD = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackInitialViewTimings_1 = require("./trackInitialViewTimings");
var trackViewMetrics_1 = require("./trackViewMetrics");
exports.THROTTLE_VIEW_UPDATE_PERIOD = 3000;
exports.SESSION_KEEP_ALIVE_INTERVAL = 5 * browser_core_1.ONE_MINUTE;
function trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, areViewsTrackedAutomatically, initialViewOptions) {
    var _a = trackInitialView(initialViewOptions), stopInitialViewTracking = _a.stop, initialView = _a.initialView;
    var currentView = initialView;
    var stopViewLifeCycle = startViewLifeCycle().stop;
    var locationChangeSubscription;
    if (areViewsTrackedAutomatically) {
        locationChangeSubscription = renewViewOnLocationChange(locationChangeObservable);
    }
    function trackInitialView(options) {
        var initialView = newView(lifeCycle, domMutationObservable, configuration, location, "initial_load" /* INITIAL_LOAD */, (0, browser_core_1.clocksOrigin)(), options);
        var stop = (0, trackInitialViewTimings_1.trackInitialViewTimings)(lifeCycle, function (timings) {
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
        var keepAliveInterval = window.setInterval((0, browser_core_1.monitor)(function () {
            currentView.triggerUpdate();
        }), exports.SESSION_KEEP_ALIVE_INTERVAL);
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
            if (time === void 0) { time = (0, browser_core_1.timeStampNow)(); }
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
exports.trackViews = trackViews;
function newView(lifeCycle, domMutationObservable, configuration, initialLocation, loadingType, startClocks, viewOptions) {
    if (startClocks === void 0) { startClocks = (0, browser_core_1.clocksNow)(); }
    // Setup initial values
    var id = (0, browser_core_1.generateUUID)();
    var timings = {};
    var customTimings = {};
    var documentVersion = 0;
    var endClocks;
    var location = (0, browser_core_1.shallowClone)(initialLocation);
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
    var _a = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(triggerViewUpdate), exports.THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    }), scheduleViewUpdate = _a.throttled, cancelScheduleViewUpdate = _a.cancel;
    var _b = (0, trackViewMetrics_1.trackViewMetrics)(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, startClocks), setLoadEvent = _b.setLoadEvent, stopViewMetricsTracking = _b.stop, viewMetrics = _b.viewMetrics;
    // Initial view update
    triggerViewUpdate();
    function triggerViewUpdate() {
        documentVersion += 1;
        var currentEnd = endClocks === undefined ? (0, browser_core_1.timeStampNow)() : endClocks.timeStamp;
        lifeCycle.notify(3 /* VIEW_UPDATED */, (0, browser_core_1.assign)({
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
            duration: (0, browser_core_1.elapsed)(startClocks.timeStamp, currentEnd),
            isActive: endClocks === undefined,
        }, viewMetrics));
    }
    return {
        name: name,
        service: service,
        version: version,
        scheduleUpdate: scheduleViewUpdate,
        end: function (clocks) {
            if (clocks === void 0) { clocks = (0, browser_core_1.clocksNow)(); }
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
            var relativeTime = (0, browser_core_1.looksLikeRelativeTime)(time) ? time : (0, browser_core_1.elapsed)(startClocks.timeStamp, time);
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
        browser_core_1.display.warn("Invalid timing name: ".concat(name, ", sanitized to: ").concat(sanitized));
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