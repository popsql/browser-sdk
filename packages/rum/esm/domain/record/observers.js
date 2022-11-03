var _a;
import { instrumentSetter, instrumentMethodAndCallOriginal, assign, monitor, throttle, addEventListeners, addEventListener, noop, } from '@datadog/browser-core';
import { initViewportObservable } from '@datadog/browser-rum-core';
import { NodePrivacyLevel } from '../../constants';
import { RecordType, IncrementalSource, MediaInteractionType, MouseInteractionType } from '../../types';
import { getNodePrivacyLevel, shouldMaskNode } from './privacy';
import { getElementInputValue, getSerializedNodeId, hasSerializedNode } from './serializationUtils';
import { assembleIncrementalSnapshot, forEach, getPathToNestedCSSRule, isTouchEvent } from './utils';
import { startMutationObserver } from './mutationObserver';
import { getVisualViewport, getScrollX, getScrollY, convertMouseEventToLayoutCoordinates } from './viewports';
var MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
var SCROLL_OBSERVER_THRESHOLD = 100;
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
var recordIds = new WeakMap();
var nextId = 1;
function getRecordIdForEvent(event) {
    if (!recordIds.has(event)) {
        recordIds.set(event, nextId++);
    }
    return recordIds.get(event);
}
export function initObservers(o) {
    var mutationHandler = initMutationObserver(o.mutationController, o.mutationCb, o.configuration);
    var mousemoveHandler = initMoveObserver(o.mousemoveCb);
    var mouseInteractionHandler = initMouseInteractionObserver(o.mouseInteractionCb, o.configuration.defaultPrivacyLevel);
    var scrollHandler = initScrollObserver(o.scrollCb, o.configuration.defaultPrivacyLevel, o.elementsScrollPositions);
    var viewportResizeHandler = initViewportResizeObserver(o.viewportResizeCb);
    var inputHandler = initInputObserver(o.inputCb, o.configuration.defaultPrivacyLevel);
    var mediaInteractionHandler = initMediaInteractionObserver(o.mediaInteractionCb, o.configuration.defaultPrivacyLevel);
    var styleSheetObserver = initStyleSheetObserver(o.styleSheetCb);
    var focusHandler = initFocusObserver(o.focusCb);
    var visualViewportResizeHandler = initVisualViewportResizeObserver(o.visualViewportResizeCb);
    var frustrationHandler = initFrustrationObserver(o.lifeCycle, o.frustrationCb);
    return function () {
        mutationHandler();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
        mediaInteractionHandler();
        styleSheetObserver();
        focusHandler();
        visualViewportResizeHandler();
        frustrationHandler();
    };
}
function initMutationObserver(mutationController, cb, configuration) {
    return startMutationObserver(mutationController, cb, configuration).stop;
}
function initMoveObserver(cb) {
    var updatePosition = throttle(monitor(function (event) {
        var target = event.target;
        if (hasSerializedNode(target)) {
            var _a = isTouchEvent(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
            var position = {
                id: getSerializedNodeId(target),
                timeOffset: 0,
                x: clientX,
                y: clientY,
            };
            if (window.visualViewport) {
                var _b = convertMouseEventToLayoutCoordinates(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
                position.x = visualViewportX;
                position.y = visualViewportY;
            }
            cb([position], isTouchEvent(event) ? IncrementalSource.TouchMove : IncrementalSource.MouseMove);
        }
    }), MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }).throttled;
    return addEventListeners(document, ["mousemove" /* MOUSE_MOVE */, "touchmove" /* TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
}
var eventTypeToMouseInteraction = (_a = {},
    _a["mouseup" /* MOUSE_UP */] = MouseInteractionType.MouseUp,
    _a["mousedown" /* MOUSE_DOWN */] = MouseInteractionType.MouseDown,
    _a["click" /* CLICK */] = MouseInteractionType.Click,
    _a["contextmenu" /* CONTEXT_MENU */] = MouseInteractionType.ContextMenu,
    _a["dblclick" /* DBL_CLICK */] = MouseInteractionType.DblClick,
    _a["focus" /* FOCUS */] = MouseInteractionType.Focus,
    _a["blur" /* BLUR */] = MouseInteractionType.Blur,
    _a["touchstart" /* TOUCH_START */] = MouseInteractionType.TouchStart,
    _a["touchend" /* TOUCH_END */] = MouseInteractionType.TouchEnd,
    _a);
function initMouseInteractionObserver(cb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if (getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN || !hasSerializedNode(target)) {
            return;
        }
        var _a = isTouchEvent(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
        var position = {
            id: getSerializedNodeId(target),
            type: eventTypeToMouseInteraction[event.type],
            x: clientX,
            y: clientY,
        };
        if (window.visualViewport) {
            var _b = convertMouseEventToLayoutCoordinates(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
            position.x = visualViewportX;
            position.y = visualViewportY;
        }
        var record = assign({ id: getRecordIdForEvent(event) }, assembleIncrementalSnapshot(IncrementalSource.MouseInteraction, position));
        cb(record);
    };
    return addEventListeners(document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    }).stop;
}
function initScrollObserver(cb, defaultPrivacyLevel, elementsScrollPositions) {
    var updatePosition = throttle(monitor(function (event) {
        var target = event.target;
        if (!target ||
            getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        var id = getSerializedNodeId(target);
        var scrollPositions = target === document
            ? {
                scrollTop: getScrollY(),
                scrollLeft: getScrollX(),
            }
            : {
                scrollTop: Math.round(target.scrollTop),
                scrollLeft: Math.round(target.scrollLeft),
            };
        elementsScrollPositions.set(target, scrollPositions);
        cb({
            id: id,
            x: scrollPositions.scrollLeft,
            y: scrollPositions.scrollTop,
        });
    }), SCROLL_OBSERVER_THRESHOLD).throttled;
    return addEventListener(document, "scroll" /* SCROLL */, updatePosition, { capture: true, passive: true }).stop;
}
function initViewportResizeObserver(cb) {
    return initViewportObservable().subscribe(cb).unsubscribe;
}
export function initInputObserver(cb, defaultPrivacyLevel) {
    var lastInputStateMap = new WeakMap();
    function onElementChange(target) {
        var nodePrivacyLevel = getNodePrivacyLevel(target, defaultPrivacyLevel);
        if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
            return;
        }
        var type = target.type;
        var inputState;
        if (type === 'radio' || type === 'checkbox') {
            if (shouldMaskNode(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            var value = getElementInputValue(target, nodePrivacyLevel);
            if (value === undefined) {
                return;
            }
            inputState = { text: value };
        }
        // Can be multiple changes on the same node within the same batched mutation observation.
        cbWithDedup(target, inputState);
        // If a radio was checked, other radios with the same name attribute will be unchecked.
        var name = target.name;
        if (type === 'radio' && name && target.checked) {
            forEach(document.querySelectorAll("input[type=\"radio\"][name=\"".concat(name, "\"]")), function (el) {
                if (el !== target) {
                    // TODO: Consider the privacy implications for various differing input privacy levels
                    cbWithDedup(el, { isChecked: false });
                }
            });
        }
    }
    /**
     * There can be multiple changes on the same node within the same batched mutation observation.
     */
    function cbWithDedup(target, inputState) {
        if (!hasSerializedNode(target)) {
            return;
        }
        var lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            cb(assign({
                id: getSerializedNodeId(target),
            }, inputState));
        }
    }
    var stopEventListeners = addEventListeners(document, ["input" /* INPUT */, "change" /* CHANGE */], function (event) {
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement) {
            onElementChange(event.target);
        }
    }, {
        capture: true,
        passive: true,
    }).stop;
    var instrumentationStoppers = [
        instrumentSetter(HTMLInputElement.prototype, 'value', onElementChange),
        instrumentSetter(HTMLInputElement.prototype, 'checked', onElementChange),
        instrumentSetter(HTMLSelectElement.prototype, 'value', onElementChange),
        instrumentSetter(HTMLTextAreaElement.prototype, 'value', onElementChange),
        instrumentSetter(HTMLSelectElement.prototype, 'selectedIndex', onElementChange),
    ];
    return function () {
        instrumentationStoppers.forEach(function (stopper) { return stopper.stop(); });
        stopEventListeners();
    };
}
export function initStyleSheetObserver(cb) {
    function checkStyleSheetAndCallback(styleSheet, callback) {
        if (styleSheet && hasSerializedNode(styleSheet.ownerNode)) {
            callback(getSerializedNodeId(styleSheet.ownerNode));
        }
    }
    var instrumentationStoppers = [
        instrumentMethodAndCallOriginal(CSSStyleSheet.prototype, 'insertRule', {
            before: function (rule, index) {
                checkStyleSheetAndCallback(this, function (id) { return cb({ id: id, adds: [{ rule: rule, index: index }] }); });
            },
        }),
        instrumentMethodAndCallOriginal(CSSStyleSheet.prototype, 'deleteRule', {
            before: function (index) {
                checkStyleSheetAndCallback(this, function (id) { return cb({ id: id, removes: [{ index: index }] }); });
            },
        }),
    ];
    if (typeof CSSGroupingRule !== 'undefined') {
        instrumentGroupingCSSRuleClass(CSSGroupingRule);
    }
    else {
        instrumentGroupingCSSRuleClass(CSSMediaRule);
        instrumentGroupingCSSRuleClass(CSSSupportsRule);
    }
    function instrumentGroupingCSSRuleClass(cls) {
        instrumentationStoppers.push(instrumentMethodAndCallOriginal(cls.prototype, 'insertRule', {
            before: function (rule, index) {
                var _this = this;
                checkStyleSheetAndCallback(this.parentStyleSheet, function (id) {
                    var path = getPathToNestedCSSRule(_this);
                    if (path) {
                        path.push(index || 0);
                        cb({ id: id, adds: [{ rule: rule, index: path }] });
                    }
                });
            },
        }), instrumentMethodAndCallOriginal(cls.prototype, 'deleteRule', {
            before: function (index) {
                var _this = this;
                checkStyleSheetAndCallback(this.parentStyleSheet, function (id) {
                    var path = getPathToNestedCSSRule(_this);
                    if (path) {
                        path.push(index);
                        cb({ id: id, removes: [{ index: path }] });
                    }
                });
            },
        }));
    }
    return function () { return instrumentationStoppers.forEach(function (stopper) { return stopper.stop(); }); };
}
function initMediaInteractionObserver(mediaInteractionCb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if (!target ||
            getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        mediaInteractionCb({
            id: getSerializedNodeId(target),
            type: event.type === "play" /* PLAY */ ? MediaInteractionType.Play : MediaInteractionType.Pause,
        });
    };
    return addEventListeners(document, ["play" /* PLAY */, "pause" /* PAUSE */], handler, { capture: true, passive: true }).stop;
}
function initFocusObserver(focusCb) {
    return addEventListeners(window, ["focus" /* FOCUS */, "blur" /* BLUR */], function () {
        focusCb({ has_focus: document.hasFocus() });
    }).stop;
}
function initVisualViewportResizeObserver(cb) {
    if (!window.visualViewport) {
        return noop;
    }
    var _a = throttle(monitor(function () {
        cb(getVisualViewport());
    }), VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = addEventListeners(window.visualViewport, ["resize" /* RESIZE */, "scroll" /* SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    }).stop;
    return function stop() {
        removeListener();
        cancelThrottle();
    };
}
export function initFrustrationObserver(lifeCycle, frustrationCb) {
    return lifeCycle.subscribe(10 /* RAW_RUM_EVENT_COLLECTED */, function (data) {
        var _a, _b, _c;
        if (data.rawRumEvent.type === "action" /* ACTION */ &&
            data.rawRumEvent.action.type === "click" /* CLICK */ &&
            ((_b = (_a = data.rawRumEvent.action.frustration) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.length) &&
            'events' in data.domainContext &&
            ((_c = data.domainContext.events) === null || _c === void 0 ? void 0 : _c.length)) {
            frustrationCb({
                timestamp: data.rawRumEvent.date,
                type: RecordType.FrustrationRecord,
                data: {
                    frustrationTypes: data.rawRumEvent.action.frustration.type,
                    recordIds: data.domainContext.events.map(function (e) { return getRecordIdForEvent(e); }),
                },
            });
        }
    }).unsubscribe;
}
//# sourceMappingURL=observers.js.map