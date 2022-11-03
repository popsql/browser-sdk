"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startViewContexts = exports.VIEW_CONTEXT_TIME_OUT_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.VIEW_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
function startViewContexts(lifeCycle) {
    var viewContextHistory = new browser_core_1.ContextHistory(exports.VIEW_CONTEXT_TIME_OUT_DELAY);
    lifeCycle.subscribe(2 /* VIEW_CREATED */, function (view) {
        viewContextHistory.add(buildViewContext(view), view.startClocks.relative);
    });
    lifeCycle.subscribe(4 /* VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        viewContextHistory.closeActive(endClocks.relative);
    });
    lifeCycle.subscribe(8 /* SESSION_RENEWED */, function () {
        viewContextHistory.reset();
    });
    function buildViewContext(view) {
        return {
            service: view.service,
            version: view.version,
            id: view.id,
            name: view.name,
        };
    }
    return {
        findView: function (startTime) { return viewContextHistory.find(startTime); },
        stop: function () {
            viewContextHistory.stop();
        },
    };
}
exports.startViewContexts = startViewContexts;
//# sourceMappingURL=viewContexts.js.map