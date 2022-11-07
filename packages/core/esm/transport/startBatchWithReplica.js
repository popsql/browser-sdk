import { Batch } from './batch';
import { createHttpRequest } from './httpRequest';
export function startBatchWithReplica(configuration, endpoint, reportError, replicaEndpoint) {
    var primaryBatch = createBatch(endpoint);
    var replicaBatch;
    if (replicaEndpoint) {
        replicaBatch = createBatch(replicaEndpoint);
    }
    function createBatch(endpointBuilder) {
        return new Batch(createHttpRequest(endpointBuilder, configuration.batchBytesLimit, reportError), configuration.batchMessagesLimit, configuration.batchBytesLimit, configuration.messageBytesLimit, configuration.flushTimeout);
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
//# sourceMappingURL=startBatchWithReplica.js.map