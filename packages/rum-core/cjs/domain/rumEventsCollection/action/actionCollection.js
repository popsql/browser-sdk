"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startActionCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackClickActions_1 = require("./trackClickActions");
function startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts) {
    lifeCycle.subscribe(1 /* AUTO_ACTION_COMPLETED */, function (action) {
        return lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processAction(action, foregroundContexts));
    });
    var actionContexts = { findActionId: browser_core_1.noop };
    if (configuration.trackInteractions) {
        actionContexts = (0, trackClickActions_1.trackClickActions)(lifeCycle, domMutationObservable, configuration).actionContexts;
    }
    return {
        addAction: function (action, savedCommonContext) {
            lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, (0, browser_core_1.assign)({
                savedCommonContext: savedCommonContext,
            }, processAction(action, foregroundContexts)));
        },
        actionContexts: actionContexts,
    };
}
exports.startActionCollection = startActionCollection;
function processAction(action, foregroundContexts) {
    var autoActionProperties = isAutoAction(action)
        ? {
            action: {
                id: action.id,
                loading_time: (0, browser_core_1.toServerDuration)(action.duration),
                frustration: {
                    type: action.frustrationTypes,
                },
                error: {
                    count: action.counts.errorCount,
                },
                long_task: {
                    count: action.counts.longTaskCount,
                },
                resource: {
                    count: action.counts.resourceCount,
                },
            },
            _dd: {
                action: {
                    target: action.target,
                    position: action.position,
                },
            },
        }
        : undefined;
    var customerContext = !isAutoAction(action) ? action.context : undefined;
    var actionEvent = (0, browser_core_1.combine)({
        action: {
            id: (0, browser_core_1.generateUUID)(),
            target: {
                name: action.name,
            },
            type: action.type,
        },
        date: action.startClocks.timeStamp,
        type: "action" /* ACTION */,
    }, autoActionProperties);
    var inForeground = foregroundContexts.isInForegroundAt(action.startClocks.relative);
    if (inForeground !== undefined) {
        actionEvent.view = { in_foreground: inForeground };
    }
    return {
        customerContext: customerContext,
        rawRumEvent: actionEvent,
        startTime: action.startClocks.relative,
        domainContext: isAutoAction(action) ? { event: action.event, events: action.events } : {},
    };
}
function isAutoAction(action) {
    return action.type !== "custom" /* CUSTOM */;
}
//# sourceMappingURL=actionCollection.js.map