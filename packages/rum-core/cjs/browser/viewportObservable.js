"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewportDimension = exports.createViewportObservable = exports.initViewportObservable = void 0;
var browser_core_1 = require("@datadog/browser-core");
var viewportObservable;
function initViewportObservable() {
    if (!viewportObservable) {
        viewportObservable = createViewportObservable();
    }
    return viewportObservable;
}
exports.initViewportObservable = initViewportObservable;
function createViewportObservable() {
    var observable = new browser_core_1.Observable(function () {
        var updateDimension = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function () {
            observable.notify(getViewportDimension());
        }), 200).throttled;
        return (0, browser_core_1.addEventListener)(window, "resize" /* RESIZE */, updateDimension, { capture: true, passive: true }).stop;
    });
    return observable;
}
exports.createViewportObservable = createViewportObservable;
// excludes the width and height of any rendered classic scrollbar that is fixed to the visual viewport
function getViewportDimension() {
    var visual = window.visualViewport;
    if (visual) {
        return {
            width: Number(visual.width * visual.scale),
            height: Number(visual.height * visual.scale),
        };
    }
    return {
        width: Number(window.innerWidth || 0),
        height: Number(window.innerHeight || 0),
    };
}
exports.getViewportDimension = getViewportDimension;
//# sourceMappingURL=viewportObservable.js.map