import { getEventBridge } from '@datadog/browser-core';
export function startRumEventBridge(lifeCycle) {
    var bridge = getEventBridge();
    lifeCycle.subscribe(11 /* RUM_EVENT_COLLECTED */, function (serverRumEvent) {
        bridge.send('rum', serverRumEvent);
    });
}
//# sourceMappingURL=startRumEventBridge.js.map