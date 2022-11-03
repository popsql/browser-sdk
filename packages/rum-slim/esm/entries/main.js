// Keep the following in sync with packages/rum/src/entries/main.ts
import { defineGlobal, getGlobalObject, noop } from '@datadog/browser-core';
import { makeRumPublicApi, startRum } from '@datadog/browser-rum-core';
export { DefaultPrivacyLevel } from '@datadog/browser-core';
export var datadogRum = makeRumPublicApi(startRum, {
    start: noop,
    stop: noop,
    onRumStart: noop,
    isRecording: function () { return false; },
    getReplayStats: function () { return undefined; },
});
defineGlobal(getGlobalObject(), 'DD_RUM', datadogRum);
//# sourceMappingURL=main.js.map