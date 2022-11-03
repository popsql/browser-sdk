"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumEventBridge = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startRumEventBridge(lifeCycle) {
    var bridge = (0, browser_core_1.getEventBridge)();
    lifeCycle.subscribe(11 /* RUM_EVENT_COLLECTED */, function (serverRumEvent) {
        bridge.send('rum', serverRumEvent);
    });
}
exports.startRumEventBridge = startRumEventBridge;
//# sourceMappingURL=startRumEventBridge.js.map