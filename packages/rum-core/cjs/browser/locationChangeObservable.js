"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocationChangeObservable = void 0;
var browser_core_1 = require("@datadog/browser-core");
function createLocationChangeObservable(location) {
    var currentLocation = (0, browser_core_1.shallowClone)(location);
    var observable = new browser_core_1.Observable(function () {
        var stopHistoryTracking = trackHistory(onLocationChange).stop;
        var stopHashTracking = trackHash(onLocationChange).stop;
        return function () {
            stopHistoryTracking();
            stopHashTracking();
        };
    });
    function onLocationChange() {
        if (currentLocation.href === location.href) {
            return;
        }
        var newLocation = (0, browser_core_1.shallowClone)(location);
        observable.notify({
            newLocation: newLocation,
            oldLocation: currentLocation,
        });
        currentLocation = newLocation;
    }
    return observable;
}
exports.createLocationChangeObservable = createLocationChangeObservable;
function trackHistory(onHistoryChange) {
    var stopInstrumentingPushState = (0, browser_core_1.instrumentMethodAndCallOriginal)(history, 'pushState', {
        after: onHistoryChange,
    }).stop;
    var stopInstrumentingReplaceState = (0, browser_core_1.instrumentMethodAndCallOriginal)(history, 'replaceState', {
        after: onHistoryChange,
    }).stop;
    var removeListener = (0, browser_core_1.addEventListener)(window, "popstate" /* POP_STATE */, onHistoryChange).stop;
    return {
        stop: function () {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(onHashChange) {
    return (0, browser_core_1.addEventListener)(window, "hashchange" /* HASH_CHANGE */, onHashChange);
}
//# sourceMappingURL=locationChangeObservable.js.map