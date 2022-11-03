import { toServerDuration, relativeToClocks, generateUUID } from '@datadog/browser-core';
export function startLongTaskCollection(lifeCycle, sessionManager) {
    lifeCycle.subscribe(0 /* PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType !== 'longtask') {
                break;
            }
            var session = sessionManager.findTrackedSession(entry.startTime);
            if (!session || !session.longTaskAllowed) {
                break;
            }
            var startClocks = relativeToClocks(entry.startTime);
            var rawRumEvent = {
                date: startClocks.timeStamp,
                long_task: {
                    id: generateUUID(),
                    duration: toServerDuration(entry.duration),
                },
                type: "long_task" /* LONG_TASK */,
                _dd: {
                    discarded: false,
                },
            };
            lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, {
                rawRumEvent: rawRumEvent,
                startTime: startClocks.relative,
                domainContext: { performanceEntry: entry.toJSON() },
            });
        }
    });
}
//# sourceMappingURL=longTaskCollection.js.map