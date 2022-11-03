import { monitor, Observable, throttle, addEventListener } from '@datadog/browser-core';
var viewportObservable;
export function initViewportObservable() {
    if (!viewportObservable) {
        viewportObservable = createViewportObservable();
    }
    return viewportObservable;
}
export function createViewportObservable() {
    var observable = new Observable(function () {
        var updateDimension = throttle(monitor(function () {
            observable.notify(getViewportDimension());
        }), 200).throttled;
        return addEventListener(window, "resize" /* RESIZE */, updateDimension, { capture: true, passive: true }).stop;
    });
    return observable;
}
// excludes the width and height of any rendered classic scrollbar that is fixed to the visual viewport
export function getViewportDimension() {
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
//# sourceMappingURL=viewportObservable.js.map