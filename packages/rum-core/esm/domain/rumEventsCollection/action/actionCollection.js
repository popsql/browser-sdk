import { noop, assign, combine, toServerDuration, generateUUID } from '@datadog/browser-core';
import { trackClickActions } from './trackClickActions';
export function startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts) {
    lifeCycle.subscribe(1 /* AUTO_ACTION_COMPLETED */, function (action) {
        return lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processAction(action, foregroundContexts));
    });
    var actionContexts = { findActionId: noop };
    if (configuration.trackInteractions) {
        actionContexts = trackClickActions(lifeCycle, domMutationObservable, configuration).actionContexts;
    }
    return {
        addAction: function (action, savedCommonContext) {
            lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, assign({
                savedCommonContext: savedCommonContext,
            }, processAction(action, foregroundContexts)));
        },
        actionContexts: actionContexts,
    };
}
function processAction(action, foregroundContexts) {
    var autoActionProperties = isAutoAction(action)
        ? {
            action: {
                id: action.id,
                loading_time: toServerDuration(action.duration),
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
    var actionEvent = combine({
        action: {
            id: generateUUID(),
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