import { catchUserErrors } from '../tools/catchUserErrors';
import { setDebugMode } from '../tools/monitor';
import { assign } from '../tools/utils';
export function makePublicApi(stub) {
    var publicApi = assign({
        version: "dev",
        // This API method is intentionally not monitored, since the only thing executed is the
        // user-provided 'callback'.  All SDK usages executed in the callback should be monitored, and
        // we don't want to interfere with the user uncaught exceptions.
        onReady: function (callback) {
            callback();
        },
    }, stub);
    // Add a "hidden" property to set debug mode. We define it that way to hide it
    // as much as possible but of course it's not a real protection.
    Object.defineProperty(publicApi, '_setDebug', {
        get: function () {
            return setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
export function defineGlobal(global, name, api) {
    var existingGlobalVariable = global[name];
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach(function (fn) { return catchUserErrors(fn, 'onReady callback threw an error:')(); });
    }
}
//# sourceMappingURL=init.js.map