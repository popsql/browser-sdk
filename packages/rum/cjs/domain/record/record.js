"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var types_1 = require("../../types");
var serialize_1 = require("./serialize");
var observers_1 = require("./observers");
var mutationObserver_1 = require("./mutationObserver");
var viewports_1 = require("./viewports");
var utils_1 = require("./utils");
var elementsScrollPositions_1 = require("./elementsScrollPositions");
function record(options) {
    var emit = options.emit;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var mutationController = new mutationObserver_1.MutationController();
    var elementsScrollPositions = (0, elementsScrollPositions_1.createElementsScrollPositions)();
    var takeFullSnapshot = function (timestamp, serializationContext) {
        if (timestamp === void 0) { timestamp = (0, browser_core_1.timeStampNow)(); }
        if (serializationContext === void 0) { serializationContext = { status: 0 /* INITIAL_FULL_SNAPSHOT */, elementsScrollPositions: elementsScrollPositions }; }
        mutationController.flush(); // process any pending mutation before taking a full snapshot
        var _a = (0, browser_rum_core_1.getViewportDimension)(), width = _a.width, height = _a.height;
        emit({
            data: {
                height: height,
                href: window.location.href,
                width: width,
            },
            type: types_1.RecordType.Meta,
            timestamp: timestamp,
        });
        emit({
            data: {
                has_focus: document.hasFocus(),
            },
            type: types_1.RecordType.Focus,
            timestamp: timestamp,
        });
        emit({
            data: {
                node: (0, serialize_1.serializeDocument)(document, options.configuration, serializationContext),
                initialOffset: {
                    left: (0, viewports_1.getScrollX)(),
                    top: (0, viewports_1.getScrollY)(),
                },
            },
            type: types_1.RecordType.FullSnapshot,
            timestamp: timestamp,
        });
        if (window.visualViewport) {
            emit({
                data: (0, viewports_1.getVisualViewport)(),
                type: types_1.RecordType.VisualViewport,
                timestamp: timestamp,
            });
        }
    };
    takeFullSnapshot();
    var stopObservers = (0, observers_1.initObservers)({
        lifeCycle: options.lifeCycle,
        configuration: options.configuration,
        mutationController: mutationController,
        elementsScrollPositions: elementsScrollPositions,
        inputCb: function (v) { return emit((0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Input, v)); },
        mediaInteractionCb: function (p) {
            return emit((0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.MediaInteraction, p));
        },
        mouseInteractionCb: function (mouseInteractionRecord) { return emit(mouseInteractionRecord); },
        mousemoveCb: function (positions, source) { return emit((0, utils_1.assembleIncrementalSnapshot)(source, { positions: positions })); },
        mutationCb: function (m) { return emit((0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Mutation, m)); },
        scrollCb: function (p) { return emit((0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Scroll, p)); },
        styleSheetCb: function (r) { return emit((0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.StyleSheetRule, r)); },
        viewportResizeCb: function (d) { return emit((0, utils_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.ViewportResize, d)); },
        frustrationCb: function (frustrationRecord) { return emit(frustrationRecord); },
        focusCb: function (data) {
            return emit({
                data: data,
                type: types_1.RecordType.Focus,
                timestamp: (0, browser_core_1.timeStampNow)(),
            });
        },
        visualViewportResizeCb: function (data) {
            emit({
                data: data,
                type: types_1.RecordType.VisualViewport,
                timestamp: (0, browser_core_1.timeStampNow)(),
            });
        },
    });
    return {
        stop: stopObservers,
        takeSubsequentFullSnapshot: function (timestamp) {
            return takeFullSnapshot(timestamp, {
                status: 1 /* SUBSEQUENT_FULL_SNAPSHOT */,
                elementsScrollPositions: elementsScrollPositions,
            });
        },
        flushMutations: function () { return mutationController.flush(); },
    };
}
exports.record = record;
//# sourceMappingURL=record.js.map