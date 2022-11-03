import { SESSION_TIME_OUT_DELAY, ContextHistory } from '@datadog/browser-core';
export var VIEW_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
export function startViewContexts(lifeCycle) {
    var viewContextHistory = new ContextHistory(VIEW_CONTEXT_TIME_OUT_DELAY);
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
//# sourceMappingURL=viewContexts.js.map