import { computeStackTrace } from '../tracekit';
import { createHandlingStack, formatErrorMessage, toStackTraceString } from '../../tools/error';
import { mergeObservables, Observable } from '../../tools/observable';
import { find, jsonStringify } from '../../tools/utils';
import { ConsoleApiName } from '../../tools/display';
import { callMonitored } from '../../tools/monitor';
var consoleObservablesByApi = {};
export function initConsoleObservable(apis) {
    var consoleObservables = apis.map(function (api) {
        if (!consoleObservablesByApi[api]) {
            consoleObservablesByApi[api] = createConsoleObservable(api);
        }
        return consoleObservablesByApi[api];
    });
    return mergeObservables.apply(void 0, consoleObservables);
}
/* eslint-disable no-console */
function createConsoleObservable(api) {
    var observable = new Observable(function () {
        var originalConsoleApi = console[api];
        console[api] = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            originalConsoleApi.apply(console, params);
            var handlingStack = createHandlingStack();
            callMonitored(function () {
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
    if (api === ConsoleApiName.error) {
        var firstErrorParam = find(params, function (param) { return param instanceof Error; });
        stack = firstErrorParam ? toStackTraceString(computeStackTrace(firstErrorParam)) : undefined;
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
        return formatErrorMessage(computeStackTrace(param));
    }
    return jsonStringify(param, 2);
}
//# sourceMappingURL=consoleObservable.js.map