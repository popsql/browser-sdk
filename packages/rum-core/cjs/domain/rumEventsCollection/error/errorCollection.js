"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doStartErrorCollection = exports.startErrorCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackConsoleError_1 = require("./trackConsoleError");
var trackReportError_1 = require("./trackReportError");
function startErrorCollection(lifeCycle, foregroundContexts) {
    var errorObservable = new browser_core_1.Observable();
    (0, trackConsoleError_1.trackConsoleError)(errorObservable);
    (0, browser_core_1.trackRuntimeError)(errorObservable);
    (0, trackReportError_1.trackReportError)(errorObservable);
    errorObservable.subscribe(function (error) { return lifeCycle.notify(12 /* RAW_ERROR_COLLECTED */, { error: error }); });
    return doStartErrorCollection(lifeCycle, foregroundContexts);
}
exports.startErrorCollection = startErrorCollection;
function doStartErrorCollection(lifeCycle, foregroundContexts) {
    lifeCycle.subscribe(12 /* RAW_ERROR_COLLECTED */, function (_a) {
        var error = _a.error, customerContext = _a.customerContext, savedCommonContext = _a.savedCommonContext;
        lifeCycle.notify(10 /* RAW_RUM_EVENT_COLLECTED */, (0, browser_core_1.assign)({
            customerContext: customerContext,
            savedCommonContext: savedCommonContext,
        }, processError(error, foregroundContexts)));
    });
    return {
        addError: function (_a, savedCommonContext) {
            var error = _a.error, handlingStack = _a.handlingStack, startClocks = _a.startClocks, customerContext = _a.context;
            var stackTrace = error instanceof Error ? (0, browser_core_1.computeStackTrace)(error) : undefined;
            var rawError = (0, browser_core_1.computeRawError)({
                stackTrace: stackTrace,
                originalError: error,
                handlingStack: handlingStack,
                startClocks: startClocks,
                nonErrorPrefix: 'Provided',
                source: browser_core_1.ErrorSource.CUSTOM,
                handling: "handled" /* HANDLED */,
            });
            lifeCycle.notify(12 /* RAW_ERROR_COLLECTED */, {
                customerContext: customerContext,
                savedCommonContext: savedCommonContext,
                error: rawError,
            });
        },
    };
}
exports.doStartErrorCollection = doStartErrorCollection;
function processError(error, foregroundContexts) {
    var rawRumEvent = {
        date: error.startClocks.timeStamp,
        error: {
            id: (0, browser_core_1.generateUUID)(),
            message: error.message,
            source: error.source,
            stack: error.stack,
            handling_stack: error.handlingStack,
            type: error.type,
            handling: error.handling,
            causes: error.causes,
            source_type: 'browser',
        },
        type: "error" /* ERROR */,
    };
    var inForeground = foregroundContexts.isInForegroundAt(error.startClocks.relative);
    if (inForeground !== undefined) {
        rawRumEvent.view = { in_foreground: inForeground };
    }
    return {
        rawRumEvent: rawRumEvent,
        startTime: error.startClocks.relative,
        domainContext: {
            error: error.originalError,
        },
    };
}
//# sourceMappingURL=errorCollection.js.map