"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFrustrationObserver = exports.initStyleSheetObserver = exports.initInputObserver = exports.initObservers = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var constants_1 = require("../../constants");
var types_1 = require("../../types");
var privacy_1 = require("./privacy");
var serializationUtils_1 = require("./serializationUtils");
var utils_1 = require("./utils");
var mutationObserver_1 = require("./mutationObserver");
var viewports_1 = require("./viewports");
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
function initObservers(o) {
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
exports.initObservers = initObservers;
function initMutationObserver(mutationController, cb, configuration) {
    return (0, mutationObserver_1.startMutationObserver)(mutationController, cb, configuration).stop;
}
function initMoveObserver(cb) {
    var updatePosition = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function (event) {
        var target = event.target;
        if ((0, serializationUtils_1.hasSerializedNode)(target)) {
            var _a = (0, utils_1.isTouchEvent)(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
            var position = {
                id: (0, serializationUtils_1.getSerializedNodeId)(target),
                timeOffset: 0,
                x: clientX,
                y: clientY,
            };
            if (window.visualViewport) {
                var _b = (0, viewports_1.convertMouseEventToLayoutCoordinates)(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
                position.x = visualViewportX;
                position.y = visualViewportY;
            }
            cb([position], (0, utils_1.isTouchEvent)(event) ? types_1.IncrementalSource.TouchMove : types_1.IncrementalSource.MouseMove);
        }
    }), MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }).throttled;
    return (0, browser_core_1.addEventListeners)(document, ["mousemove" /* MOUSE_MOVE */, "touchmove" /* TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
}
var eventTypeToMouseInteraction = (_a = {},
    _a["mouseup" /* MOUSE_UP */] = types_1.MouseInteractionType.MouseUp,
    _a["mousedown" /* MOUSE_DOWN */] = types_1.MouseInteractionType.MouseDown,
    _a["click" /* CLICK */] = types_1.MouseInteractionType.Click,
    _a["contextmenu" /* CONTEXT_MENU */] = types_1.MouseInteractionType.ContextMenu,
    _a["dblclick" /* DBL_CLICK */] = types_1.MouseInteractionType.DblClick,
    _a["focus" /* FOCUS */] = types_1.MouseInteractionType.Focus,
    _a["blur" /* BLUR */] = types_1.MouseInteractionType.Blur,
    _a["touchstart" /* TOUCH_START */] = types_1.MouseInteractionType.TouchStart,
    _a["touchend" /* TOUCH_END */] = types_1.MouseInteractionType.TouchEnd,
    _a);
function initMouseInteractionObserver(cb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if ((0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN || !(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        var _a = (0, utils_1.isTouchEvent)(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
        var position = {
            id: (0, serializationUtils_1.getSerializedNodeId)(target),
            type: eventTypeToMouseInteraction[event.type],
            x: clientX,
            y: clientY,
        };
        if (window.visualViewport) {
            var _b = (0, viewports_1.convertMouseEventToLayoutCoordinates)(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
            position.x = visualViewportX;
            position.y = visualViewportY;
        }
        var record = (0, browser_core_1.assign)({ id: getRecordIdForEvent(event) }, (0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.MouseInteraction, position));
        cb(record);
    };
    return (0, browser_core_1.addEventListeners)(document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    }).stop;
}
function initScrollObserver(cb, defaultPrivacyLevel, elementsScrollPositions) {
    var updatePosition = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function (event) {
        var target = event.target;
        if (!target ||
            (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN ||
            !(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        var id = (0, serializationUtils_1.getSerializedNodeId)(target);
        var scrollPositions = target === document
            ? {
                scrollTop: (0, viewports_1.getScrollY)(),
                scrollLeft: (0, viewports_1.getScrollX)(),
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
    return (0, browser_core_1.addEventListener)(document, "scroll" /* SCROLL */, updatePosition, { capture: true, passive: true }).stop;
}
function initViewportResizeObserver(cb) {
    return (0, browser_rum_core_1.initViewportObservable)().subscribe(cb).unsubscribe;
}
function initInputObserver(cb, defaultPrivacyLevel) {
    var lastInputStateMap = new WeakMap();
    function onElementChange(target) {
        var nodePrivacyLevel = (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel);
        if (nodePrivacyLevel === constants_1.NodePrivacyLevel.HIDDEN) {
            return;
        }
        var type = target.type;
        var inputState;
        if (type === 'radio' || type === 'checkbox') {
            if ((0, privacy_1.shouldMaskNode)(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            var value = (0, serializationUtils_1.getElementInputValue)(target, nodePrivacyLevel);
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
            (0, utils_1.forEach)(document.querySelectorAll("input[type=\"radio\"][name=\"".concat(name, "\"]")), function (el) {
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
        if (!(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        var lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            cb((0, browser_core_1.assign)({
                id: (0, serializationUtils_1.getSerializedNodeId)(target),
            }, inputState));
        }
    }
    var stopEventListeners = (0, browser_core_1.addEventListeners)(document, ["input" /* INPUT */, "change" /* CHANGE */], function (event) {
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
        (0, browser_core_1.instrumentSetter)(HTMLInputElement.prototype, 'value', onElementChange),
        (0, browser_core_1.instrumentSetter)(HTMLInputElement.prototype, 'checked', onElementChange),
        (0, browser_core_1.instrumentSetter)(HTMLSelectElement.prototype, 'value', onElementChange),
        (0, browser_core_1.instrumentSetter)(HTMLTextAreaElement.prototype, 'value', onElementChange),
        (0, browser_core_1.instrumentSetter)(HTMLSelectElement.prototype, 'selectedIndex', onElementChange),
    ];
    return function () {
        instrumentationStoppers.forEach(function (stopper) { return stopper.stop(); });
        stopEventListeners();
    };
}
exports.initInputObserver = initInputObserver;
function initStyleSheetObserver(cb) {
    function checkStyleSheetAndCallback(styleSheet, callback) {
        if (styleSheet && (0, serializationUtils_1.hasSerializedNode)(styleSheet.ownerNode)) {
            callback((0, serializationUtils_1.getSerializedNodeId)(styleSheet.ownerNode));
        }
    }
    var instrumentationStoppers = [
        (0, browser_core_1.instrumentMethodAndCallOriginal)(CSSStyleSheet.prototype, 'insertRule', {
            before: function (rule, index) {
                checkStyleSheetAndCallback(this, function (id) { return cb({ id: id, adds: [{ rule: rule, index: index }] }); });
            },
        }),
        (0, browser_core_1.instrumentMethodAndCallOriginal)(CSSStyleSheet.prototype, 'deleteRule', {
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
        instrumentationStoppers.push((0, browser_core_1.instrumentMethodAndCallOriginal)(cls.prototype, 'insertRule', {
            before: function (rule, index) {
                var _this = this;
                checkStyleSheetAndCallback(this.parentStyleSheet, function (id) {
                    var path = (0, utils_1.getPathToNestedCSSRule)(_this);
                    if (path) {
                        path.push(index || 0);
                        cb({ id: id, adds: [{ rule: rule, index: path }] });
                    }
                });
            },
        }), (0, browser_core_1.instrumentMethodAndCallOriginal)(cls.prototype, 'deleteRule', {
            before: function (index) {
                var _this = this;
                checkStyleSheetAndCallback(this.parentStyleSheet, function (id) {
                    var path = (0, utils_1.getPathToNestedCSSRule)(_this);
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
exports.initStyleSheetObserver = initStyleSheetObserver;
function initMediaInteractionObserver(mediaInteractionCb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if (!target ||
            (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN ||
            !(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        mediaInteractionCb({
            id: (0, serializationUtils_1.getSerializedNodeId)(target),
            type: event.type === "play" /* PLAY */ ? types_1.MediaInteractionType.Play : types_1.MediaInteractionType.Pause,
        });
    };
    return (0, browser_core_1.addEventListeners)(document, ["play" /* PLAY */, "pause" /* PAUSE */], handler, { capture: true, passive: true }).stop;
}
function initFocusObserver(focusCb) {
    return (0, browser_core_1.addEventListeners)(window, ["focus" /* FOCUS */, "blur" /* BLUR */], function () {
        focusCb({ has_focus: document.hasFocus() });
    }).stop;
}
function initVisualViewportResizeObserver(cb) {
    if (!window.visualViewport) {
        return browser_core_1.noop;
    }
    var _a = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function () {
        cb((0, viewports_1.getVisualViewport)());
    }), VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = (0, browser_core_1.addEventListeners)(window.visualViewport, ["resize" /* RESIZE */, "scroll" /* SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    }).stop;
    return function stop() {
        removeListener();
        cancelThrottle();
    };
}
function initFrustrationObserver(lifeCycle, frustrationCb) {
    return lifeCycle.subscribe(10 /* RAW_RUM_EVENT_COLLECTED */, function (data) {
        var _a, _b, _c;
        if (data.rawRumEvent.type === "action" /* ACTION */ &&
            data.rawRumEvent.action.type === "click" /* CLICK */ &&
            ((_b = (_a = data.rawRumEvent.action.frustration) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.length) &&
            'events' in data.domainContext &&
            ((_c = data.domainContext.events) === null || _c === void 0 ? void 0 : _c.length)) {
            frustrationCb({
                timestamp: data.rawRumEvent.date,
                type: types_1.RecordType.FrustrationRecord,
                data: {
                    frustrationTypes: data.rawRumEvent.action.frustration.type,
                    recordIds: data.domainContext.events.map(function (e) { return getRecordIdForEvent(e); }),
                },
            });
        }
    }).unsubscribe;
}
exports.initFrustrationObserver = initFrustrationObserver;
//# sourceMappingURL=observers.js.map