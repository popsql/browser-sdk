"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumBatch = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startRumBatch(configuration, lifeCycle, telemetryEventObservable, reportError) {
    var batch = makeRumBatch(configuration, lifeCycle, reportError);
    lifeCycle.subscribe(11 /* RUM_EVENT_COLLECTED */, function (serverRumEvent) {
        if (serverRumEvent.type === "view" /* VIEW */) {
            batch.upsert(serverRumEvent, serverRumEvent.view.id);
        }
        else {
            batch.add(serverRumEvent);
        }
    });
    telemetryEventObservable.subscribe(function (event) { return batch.add(event, (0, browser_core_1.isTelemetryReplicationAllowed)(configuration)); });
}
exports.startRumBatch = startRumBatch;
function makeRumBatch(configuration, lifeCycle, reportError) {
    var primaryBatch = createRumBatch(configuration.rumEndpointBuilder, function () {
        return lifeCycle.notify(9 /* BEFORE_UNLOAD */);
    });
    var replicaBatch;
    var replica = configuration.replica;
    if (replica !== undefined) {
        replicaBatch = createRumBatch(replica.rumEndpointBuilder);
    }
    function createRumBatch(endpointBuilder, unloadCallback) {
        return new browser_core_1.Batch((0, browser_core_1.createHttpRequest)(endpointBuilder, configuration.batchBytesLimit, reportError), configuration.batchMessagesLimit, configuration.batchBytesLimit, configuration.messageBytesLimit, configuration.flushTimeout, unloadCallback);
    }
    function withReplicaApplicationId(message) {
        return (0, browser_core_1.combine)(message, { application: { id: replica.applicationId } });
    }
    return {
        add: function (message, replicated) {
            if (replicated === void 0) { replicated = true; }
            primaryBatch.add(message);
            if (replicaBatch && replicated) {
                replicaBatch.add(withReplicaApplicationId(message));
            }
        },
        upsert: function (message, key) {
            primaryBatch.upsert(message, key);
            if (replicaBatch) {
                replicaBatch.upsert(withReplicaApplicationId(message), key);
            }
        },
    };
}
//# sourceMappingURL=startRumBatch.js.map