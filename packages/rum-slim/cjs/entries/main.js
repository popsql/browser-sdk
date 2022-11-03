"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datadogRum = exports.DefaultPrivacyLevel = void 0;
// Keep the following in sync with packages/rum/src/entries/main.ts
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var browser_core_2 = require("@datadog/browser-core");
Object.defineProperty(exports, "DefaultPrivacyLevel", { enumerable: true, get: function () { return browser_core_2.DefaultPrivacyLevel; } });
exports.datadogRum = (0, browser_rum_core_1.makeRumPublicApi)(browser_rum_core_1.startRum, {
    start: browser_core_1.noop,
    stop: browser_core_1.noop,
    onRumStart: browser_core_1.noop,
    isRecording: function () { return false; },
    getReplayStats: function () { return undefined; },
});
(0, browser_core_1.defineGlobal)((0, browser_core_1.getGlobalObject)(), 'DD_RUM', exports.datadogRum);
//# sourceMappingURL=main.js.map