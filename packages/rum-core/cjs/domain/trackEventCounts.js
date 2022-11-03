"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEventCounts = void 0;
var browser_core_1 = require("@datadog/browser-core");
function trackEventCounts(lifeCycle, callback) {
    if (callback === void 0) { callback = browser_core_1.noop; }
    var eventCounts = {
        errorCount: 0,
        longTaskCount: 0,
        resourceCount: 0,
        actionCount: 0,
        frustrationCount: 0,
    };
    var subscription = lifeCycle.subscribe(11 /* RUM_EVENT_COLLECTED */, function (event) {
        switch (event.type) {
            case "error" /* ERROR */:
                eventCounts.errorCount += 1;
                callback(eventCounts);
                break;
            case "action" /* ACTION */:
                eventCounts.actionCount += 1;
                if (event.action.frustration) {
                    eventCounts.frustrationCount += event.action.frustration.type.length;
                }
                callback(eventCounts);
                break;
            case "long_task" /* LONG_TASK */:
                eventCounts.longTaskCount += 1;
                callback(eventCounts);
                break;
            case "resource" /* RESOURCE */:
                eventCounts.resourceCount += 1;
                callback(eventCounts);
                break;
        }
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
        eventCounts: eventCounts,
    };
}
exports.trackEventCounts = trackEventCounts;
//# sourceMappingURL=trackEventCounts.js.map