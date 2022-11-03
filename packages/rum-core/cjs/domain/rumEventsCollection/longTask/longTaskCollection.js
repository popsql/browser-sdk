"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLongTaskCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startLongTaskCollection(lifeCycle, sessionManager) {
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
            var startClocks = (0, browser_core_1.relativeToClocks)(entry.startTime);
            var rawRumEvent = {
                date: startClocks.timeStamp,
                long_task: {
                    id: (0, browser_core_1.generateUUID)(),
                    duration: (0, browser_core_1.toServerDuration)(entry.duration),
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
exports.startLongTaskCollection = startLongTaskCollection;
//# sourceMappingURL=longTaskCollection.js.map