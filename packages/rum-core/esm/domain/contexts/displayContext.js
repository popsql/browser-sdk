import { isExperimentalFeatureEnabled } from '@datadog/browser-core';
import { getViewportDimension, initViewportObservable } from '../../browser/viewportObservable';
var viewport;
var stopListeners;
export function getDisplayContext() {
    if (!isExperimentalFeatureEnabled('clickmap'))
        return;
    if (!viewport) {
        viewport = getViewportDimension();
        stopListeners = initViewportObservable().subscribe(function (viewportDimension) {
            viewport = viewportDimension;
        }).unsubscribe;
    }
    return {
        viewport: viewport,
    };
}
export function resetDisplayContext() {
    if (stopListeners)
        stopListeners();
    viewport = undefined;
}
//# sourceMappingURL=displayContext.js.map