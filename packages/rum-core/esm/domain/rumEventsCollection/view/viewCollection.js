import { isEmptyObject, mapValues, toServerDuration, isNumber } from '@datadog/browser-core';
import { trackViews } from './trackViews';
export function startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, foregroundContexts, recorderApi, initialViewOptions) {
    lifeCycle.subscribe(3 /* VIEW_UPDATED */, function (view) {
        return lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, processViewUpdate(view, foregroundContexts, recorderApi));
    });
    return trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, !configuration.trackViewsManually, initialViewOptions);
}
function processViewUpdate(view, foregroundContexts, recorderApi) {
    var replayStats = recorderApi.getReplayStats(view.id);
    var viewEvent = {
        _dd: {
            document_version: view.documentVersion,
            replay_stats: replayStats,
        },
        date: view.startClocks.timeStamp,
        type: "view" /* VIEW */,
        view: {
            action: {
                count: view.eventCounts.actionCount,
            },
            frustration: {
                count: view.eventCounts.frustrationCount,
            },
            cumulative_layout_shift: view.cumulativeLayoutShift,
            first_byte: toServerDuration(view.timings.firstByte),
            dom_complete: toServerDuration(view.timings.domComplete),
            dom_content_loaded: toServerDuration(view.timings.domContentLoaded),
            dom_interactive: toServerDuration(view.timings.domInteractive),
            error: {
                count: view.eventCounts.errorCount,
            },
            first_contentful_paint: toServerDuration(view.timings.firstContentfulPaint),
            first_input_delay: toServerDuration(view.timings.firstInputDelay),
            first_input_time: toServerDuration(view.timings.firstInputTime),
            is_active: view.isActive,
            name: view.name,
            largest_contentful_paint: toServerDuration(view.timings.largestContentfulPaint),
            load_event: toServerDuration(view.timings.loadEvent),
            loading_time: discardNegativeDuration(toServerDuration(view.loadingTime)),
            loading_type: view.loadingType,
            long_task: {
                count: view.eventCounts.longTaskCount,
            },
            resource: {
                count: view.eventCounts.resourceCount,
            },
            time_spent: toServerDuration(view.duration),
            in_foreground_periods: foregroundContexts.selectInForegroundPeriodsFor(view.startClocks.relative, view.duration),
        },
        session: {
            has_replay: replayStats ? true : undefined,
        },
    };
    if (!isEmptyObject(view.customTimings)) {
        viewEvent.view.custom_timings = mapValues(view.customTimings, toServerDuration);
    }
    return {
        rawRumEvent: viewEvent,
        startTime: view.startClocks.relative,
        domainContext: {
            location: view.location,
        },
    };
}
function discardNegativeDuration(duration) {
    return isNumber(duration) && duration < 0 ? undefined : duration;
}
//# sourceMappingURL=viewCollection.js.map