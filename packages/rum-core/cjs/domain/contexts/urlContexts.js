"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startUrlContexts = exports.URL_CONTEXT_TIME_OUT_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
/**
 * We want to attach to an event:
 * - the url corresponding to its start
 * - the referrer corresponding to the previous view url (or document referrer for initial view)
 */
exports.URL_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
function startUrlContexts(lifeCycle, locationChangeObservable, location) {
    var urlContextHistory = new browser_core_1.ContextHistory(exports.URL_CONTEXT_TIME_OUT_DELAY);
    var previousViewUrl;
    lifeCycle.subscribe(4 /* VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        urlContextHistory.closeActive(endClocks.relative);
    });
    lifeCycle.subscribe(2 /* VIEW_CREATED */, function (_a) {
        var startClocks = _a.startClocks;
        var viewUrl = location.href;
        urlContextHistory.add(buildUrlContext({
            url: viewUrl,
            referrer: !previousViewUrl ? document.referrer : previousViewUrl,
        }), startClocks.relative);
        previousViewUrl = viewUrl;
    });
    var locationChangeSubscription = locationChangeObservable.subscribe(function (_a) {
        var newLocation = _a.newLocation;
        var current = urlContextHistory.find();
        if (current) {
            var changeTime = (0, browser_core_1.relativeNow)();
            urlContextHistory.closeActive(changeTime);
            urlContextHistory.add(buildUrlContext({
                url: newLocation.href,
                referrer: current.referrer,
            }), changeTime);
        }
    });
    function buildUrlContext(_a) {
        var url = _a.url, referrer = _a.referrer;
        return {
            url: url,
            referrer: referrer,
        };
    }
    return {
        findUrl: function (startTime) { return urlContextHistory.find(startTime); },
        stop: function () {
            locationChangeSubscription.unsubscribe();
            urlContextHistory.stop();
        },
    };
}
exports.startUrlContexts = startUrlContexts;
//# sourceMappingURL=urlContexts.js.map