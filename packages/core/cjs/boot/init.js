"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineGlobal = exports.makePublicApi = void 0;
var catchUserErrors_1 = require("../tools/catchUserErrors");
var monitor_1 = require("../tools/monitor");
var utils_1 = require("../tools/utils");
function makePublicApi(stub) {
    var publicApi = (0, utils_1.assign)({
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
            return monitor_1.setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
exports.makePublicApi = makePublicApi;
function defineGlobal(global, name, api) {
    var existingGlobalVariable = global[name];
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach(function (fn) { return (0, catchUserErrors_1.catchUserErrors)(fn, 'onReady callback threw an error:')(); });
    }
}
exports.defineGlobal = defineGlobal;
//# sourceMappingURL=init.js.map