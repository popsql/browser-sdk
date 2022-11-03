import { addEventListener, monitor } from '@datadog/browser-core';
export function listenActionEvents(_a) {
    var onPointerDown = _a.onPointerDown, onClick = _a.onClick;
    var hasSelectionChanged = false;
    var selectionEmptyAtPointerDown;
    var hasInputChanged = false;
    var clickContext;
    var listeners = [
        addEventListener(window, "pointerdown" /* POINTER_DOWN */, function (event) {
            hasSelectionChanged = false;
            selectionEmptyAtPointerDown = isSelectionEmpty();
            if (isMouseEventOnElement(event)) {
                clickContext = onPointerDown(event);
            }
        }, { capture: true }),
        addEventListener(window, "selectionchange" /* SELECTION_CHANGE */, function () {
            if (!selectionEmptyAtPointerDown || !isSelectionEmpty()) {
                hasSelectionChanged = true;
            }
        }, { capture: true }),
        addEventListener(window, "click" /* CLICK */, function (clickEvent) {
            if (isMouseEventOnElement(clickEvent) && clickContext) {
                // Use a scoped variable to make sure the value is not changed by other clicks
                var userActivity_1 = {
                    selection: hasSelectionChanged,
                    input: hasInputChanged,
                };
                if (!hasInputChanged) {
                    setTimeout(monitor(function () {
                        userActivity_1.input = hasInputChanged;
                    }));
                }
                onClick(clickContext, clickEvent, function () { return userActivity_1; });
                clickContext = undefined;
            }
        }, { capture: true }),
        addEventListener(window, "input" /* INPUT */, function () {
            hasInputChanged = true;
        }, { capture: true }),
    ];
    return {
        stop: function () {
            listeners.forEach(function (listener) { return listener.stop(); });
        },
    };
}
function isSelectionEmpty() {
    var selection = window.getSelection();
    return !selection || selection.isCollapsed;
}
function isMouseEventOnElement(event) {
    return event.target instanceof Element;
}
//# sourceMappingURL=listenActionEvents.js.map