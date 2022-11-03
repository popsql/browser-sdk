import { clocksNow, initConsoleObservable, ErrorSource, ConsoleApiName } from '@datadog/browser-core';
export function trackConsoleError(errorObservable) {
    var subscription = initConsoleObservable([ConsoleApiName.error]).subscribe(function (consoleError) {
        return errorObservable.notify({
            startClocks: clocksNow(),
            message: consoleError.message,
            stack: consoleError.stack,
            source: ErrorSource.CONSOLE,
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
//# sourceMappingURL=trackConsoleError.js.map