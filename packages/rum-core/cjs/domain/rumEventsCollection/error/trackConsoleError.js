"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackConsoleError = void 0;
var browser_core_1 = require("@datadog/browser-core");
function trackConsoleError(errorObservable) {
    var subscription = (0, browser_core_1.initConsoleObservable)([browser_core_1.ConsoleApiName.error]).subscribe(function (consoleError) {
        return errorObservable.notify({
            startClocks: (0, browser_core_1.clocksNow)(),
            message: consoleError.message,
            stack: consoleError.stack,
            source: browser_core_1.ErrorSource.CONSOLE,
            handling: "handled" /* HANDLED */,
            handlingStack: consoleError.handlingStack,
        });
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
    };
}
exports.trackConsoleError = trackConsoleError;
//# sourceMappingURL=trackConsoleError.js.map