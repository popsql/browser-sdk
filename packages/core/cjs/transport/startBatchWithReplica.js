"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBatchWithReplica = void 0;
var batch_1 = require("./batch");
var httpRequest_1 = require("./httpRequest");
function startBatchWithReplica(configuration, endpoint, reportError, replicaEndpoint) {
    var primaryBatch = createBatch(endpoint);
    var replicaBatch;
    if (replicaEndpoint) {
        replicaBatch = createBatch(replicaEndpoint);
    }
    function createBatch(endpointBuilder) {
        return new batch_1.Batch((0, httpRequest_1.createHttpRequest)(endpointBuilder, configuration.batchBytesLimit, reportError), configuration.batchMessagesLimit, configuration.batchBytesLimit, configuration.messageBytesLimit, configuration.flushTimeout);
    }
    return {
        add: function (message, replicated) {
            if (replicated === void 0) { replicated = true; }
            primaryBatch.add(message);
            if (replicaBatch && replicated) {
                replicaBatch.add(message);
            }
        },
    };
}
exports.startBatchWithReplica = startBatchWithReplica;
//# sourceMappingURL=startBatchWithReplica.js.map