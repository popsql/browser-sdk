"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLogsBatch = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startLogsBatch(configuration, lifeCycle, reportError) {
    var _a;
    var batch = (0, browser_core_1.startBatchWithReplica)(configuration, configuration.logsEndpointBuilder, reportError, (_a = configuration.replica) === null || _a === void 0 ? void 0 : _a.logsEndpointBuilder);
    lifeCycle.subscribe(1 /* LOG_COLLECTED */, function (serverLogsEvent) {
        batch.add(serverLogsEvent);
    });
}
exports.startLogsBatch = startLogsBatch;
//# sourceMappingURL=startLogsBatch.js.map