import { timeStampNow, isExperimentalFeatureEnabled, Observable, assign, getRelativeTime, ONE_MINUTE, ContextHistory, generateUUID, clocksNow, ONE_SECOND, elapsed, } from '@datadog/browser-core';
import { trackEventCounts } from '../../trackEventCounts';
import { waitPageActivityEnd } from '../../waitPageActivityEnd';
import { createClickChain } from './clickChain';
import { getActionNameFromElement } from './getActionNameFromElement';
import { getSelectorsFromElement } from './getSelectorsFromElement';
import { listenActionEvents } from './listenActionEvents';
import { computeFrustration } from './computeFrustration';
// Maximum duration for click actions
export var CLICK_ACTION_MAX_DURATION = 10 * ONE_SECOND;
export var ACTION_CONTEXT_TIME_OUT_DELAY = 5 * ONE_MINUTE; // arbitrary
export function trackClickActions(lifeCycle, domMutationObservable, configuration) {
    var history = new ContextHistory(ACTION_CONTEXT_TIME_OUT_DELAY);
    var stopObservable = new Observable();
    var currentClickChain;
    lifeCycle.subscribe(8 /* SESSION_RENEWED */, function () {
        history.reset();
    });
    lifeCycle.subscribe(9 /* BEFORE_UNLOAD */, stopClickChain);
    lifeCycle.subscribe(4 /* VIEW_ENDED */, stopClickChain);
    var stopActionEventsListener = listenActionEvents({
        onPointerDown: function (pointerDownEvent) { return processPointerDown(configuration, history, pointerDownEvent); },
        onClick: function (clickActionBase, clickEvent, getUserActivity) {
            return processClick(configuration, lifeCycle, domMutationObservable, history, stopObservable, appendClickToClickChain, clickActionBase, clickEvent, getUserActivity);
        },
    }).stop;
    var actionContexts = {
        findActionId: function (startTime) {
            return configuration.trackFrustrations ? history.findAll(startTime) : history.find(startTime);
        },
    };
    return {
        stop: function () {
            stopClickChain();
            stopObservable.notify();
            stopActionEventsListener();
        },
        actionContexts: actionContexts,
    };
    function appendClickToClickChain(click) {
        if (!currentClickChain || !currentClickChain.tryAppend(click)) {
            var rageClick_1 = click.clone();
            currentClickChain = createClickChain(click, function (clicks) {
                finalizeClicks(clicks, rageClick_1);
            });
        }
    }
    function stopClickChain() {
        if (currentClickChain) {
            currentClickChain.stop();
        }
    }
}
function processPointerDown(configuration, history, pointerDownEvent) {
    if (!configuration.trackFrustrations && history.find()) {
        // TODO: remove this in a future major version. To keep retrocompatibility, ignore any new
        // action if another one is already occurring.
        return;
    }
    var clickActionBase = computeClickActionBase(pointerDownEvent, configuration.actionNameAttribute);
    if (!configuration.trackFrustrations && !clickActionBase.name) {
        // TODO: remove this in a future major version. To keep retrocompatibility, ignore any action
        // with a blank name
        return;
    }
    return clickActionBase;
}
function processClick(configuration, lifeCycle, domMutationObservable, history, stopObservable, appendClickToClickChain, clickActionBase, clickEvent, getUserActivity) {
    var click = newClick(lifeCycle, history, getUserActivity, clickActionBase, clickEvent);
    if (configuration.trackFrustrations) {
        appendClickToClickChain(click);
    }
    var stopWaitPageActivityEnd = waitPageActivityEnd(lifeCycle, domMutationObservable, configuration, function (pageActivityEndEvent) {
        if (pageActivityEndEvent.hadActivity && pageActivityEndEvent.end < click.startClocks.timeStamp) {
            // If the clock is looking weird, just discard the click
            click.discard();
        }
        else {
            click.stop(pageActivityEndEvent.hadActivity ? pageActivityEndEvent.end : undefined);
            // Validate or discard the click only if we don't track frustrations. It'll be done when
            // the click chain is finalized.
            if (!configuration.trackFrustrations) {
                if (!pageActivityEndEvent.hadActivity) {
                    // If we are not tracking frustrations, we should discard the click to keep backward
                    // compatibility.
                    click.discard();
                }
                else {
                    click.validate();
                }
            }
        }
    }, CLICK_ACTION_MAX_DURATION).stop;
    var viewEndedSubscription = lifeCycle.subscribe(4 /* VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        click.stop(endClocks.timeStamp);
    });
    var stopSubscription = stopObservable.subscribe(function () {
        click.stop();
    });
    click.stopObservable.subscribe(function () {
        viewEndedSubscription.unsubscribe();
        stopWaitPageActivityEnd();
        stopSubscription.unsubscribe();
    });
}
function computeClickActionBase(event, actionNameAttribute) {
    var target;
    var position;
    if (isExperimentalFeatureEnabled('clickmap')) {
        var rect = event.target.getBoundingClientRect();
        target = assign({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        }, getSelectorsFromElement(event.target, actionNameAttribute));
        position = {
            // Use clientX and Y because for SVG element offsetX and Y are relatives to the <svg> element
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top),
        };
    }
    return {
        type: "click" /* CLICK */,
        target: target,
        position: position,
        name: getActionNameFromElement(event.target, actionNameAttribute),
    };
}
function newClick(lifeCycle, history, getUserActivity, clickActionBase, clickEvent) {
    var id = generateUUID();
    var startClocks = clocksNow();
    var historyEntry = history.add(id, startClocks.relative);
    var eventCountsSubscription = trackEventCounts(lifeCycle);
    var status = 0 /* ONGOING */;
    var activityEndTime;
    var frustrationTypes = [];
    var stopObservable = new Observable();
    function stop(newActivityEndTime) {
        if (status !== 0 /* ONGOING */) {
            return;
        }
        activityEndTime = newActivityEndTime;
        status = 1 /* STOPPED */;
        if (activityEndTime) {
            historyEntry.close(getRelativeTime(activityEndTime));
        }
        else {
            historyEntry.remove();
        }
        eventCountsSubscription.stop();
        stopObservable.notify();
    }
    return {
        event: clickEvent,
        stop: stop,
        stopObservable: stopObservable,
        get hasError() {
            return eventCountsSubscription.eventCounts.errorCount > 0;
        },
        get hasPageActivity() {
            return activityEndTime !== undefined;
        },
        getUserActivity: getUserActivity,
        addFrustration: function (frustrationType) {
            frustrationTypes.push(frustrationType);
        },
        startClocks: startClocks,
        isStopped: function () { return status === 1 /* STOPPED */ || status === 2 /* FINALIZED */; },
        clone: function () { return newClick(lifeCycle, history, getUserActivity, clickActionBase, clickEvent); },
        validate: function (domEvents) {
            stop();
            if (status !== 1 /* STOPPED */) {
                return;
            }
            var _a = eventCountsSubscription.eventCounts, resourceCount = _a.resourceCount, errorCount = _a.errorCount, longTaskCount = _a.longTaskCount;
            var clickAction = assign({
                type: "click" /* CLICK */,
                duration: activityEndTime && elapsed(startClocks.timeStamp, activityEndTime),
                startClocks: startClocks,
                id: id,
                frustrationTypes: frustrationTypes,
                counts: {
                    resourceCount: resourceCount,
                    errorCount: errorCount,
                    longTaskCount: longTaskCount,
                },
                events: domEvents !== null && domEvents !== void 0 ? domEvents : [clickEvent],
                event: clickEvent,
            }, clickActionBase);
            lifeCycle.notify(1 /* AUTO_ACTION_COMPLETED */, clickAction);
            status = 2 /* FINALIZED */;
        },
        discard: function () {
            stop();
            status = 2 /* FINALIZED */;
        },
    };
}
export function finalizeClicks(clicks, rageClick) {
    var isRage = computeFrustration(clicks, rageClick).isRage;
    if (isRage) {
        clicks.forEach(function (click) { return click.discard(); });
        rageClick.stop(timeStampNow());
        rageClick.validate(clicks.map(function (click) { return click.event; }));
    }
    else {
        rageClick.discard();
        clicks.forEach(function (click) { return click.validate(); });
    }
}
//# sourceMappingURL=trackClickActions.js.map