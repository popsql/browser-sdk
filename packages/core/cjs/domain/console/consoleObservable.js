"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConsoleObservable = void 0;
var tracekit_1 = require("../tracekit");
var error_1 = require("../../tools/error");
var observable_1 = require("../../tools/observable");
var utils_1 = require("../../tools/utils");
var display_1 = require("../../tools/display");
var monitor_1 = require("../../tools/monitor");
var consoleObservablesByApi = {};
function initConsoleObservable(apis) {
    var consoleObservables = apis.map(function (api) {
        if (!consoleObservablesByApi[api]) {
            consoleObservablesByApi[api] = createConsoleObservable(api);
        }
        return consoleObservablesByApi[api];
    });
    return observable_1.mergeObservables.apply(void 0, consoleObservables);
}
exports.initConsoleObservable = initConsoleObservable;
/* eslint-disable no-console */
function createConsoleObservable(api) {
    var observable = new observable_1.Observable(function () {
        var originalConsoleApi = console[api];
        console[api] = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            originalConsoleApi.apply(console, params);
            var handlingStack = (0, error_1.createHandlingStack)();
            (0, monitor_1.callMonitored)(function () {
                observable.notify(buildConsoleLog(params, api, handlingStack));
            });
        };
        return function () {
            console[api] = originalConsoleApi;
        };
    });
    return observable;
}
function buildConsoleLog(params, api, handlingStack) {
    // Todo: remove console error prefix in the next major version
    var message = params.map(function (param) { return formatConsoleParameters(param); }).join(' ');
    var stack;
    if (api === display_1.ConsoleApiName.error) {
        var firstErrorParam = (0, utils_1.find)(params, function (param) { return param instanceof Error; });
        stack = firstErrorParam ? (0, error_1.toStackTraceString)((0, tracekit_1.computeStackTrace)(firstErrorParam)) : undefined;
        message = "console error: ".concat(message);
    }
    return {
        api: api,
        message: message,
        stack: stack,
        handlingStack: handlingStack,
    };
}
function formatConsoleParameters(param) {
    if (typeof param === 'string') {
        return param;
    }
    if (param instanceof Error) {
        return (0, error_1.formatErrorMessage)((0, tracekit_1.computeStackTrace)(param));
    }
    return (0, utils_1.jsonStringify)(param, 2);
}
//# sourceMappingURL=consoleObservable.js.map