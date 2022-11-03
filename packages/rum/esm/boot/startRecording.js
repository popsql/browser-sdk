import { timeStampNow, createHttpRequest } from '@datadog/browser-core';
import { record } from '../domain/record';
import { startSegmentCollection, SEGMENT_BYTES_LIMIT } from '../domain/segmentCollection';
import { send } from '../transport/send';
import { RecordType } from '../types';
export function startRecording(lifeCycle, configuration, sessionManager, viewContexts, worker, httpRequest) {
    var reportError = function (error) {
        lifeCycle.notify(12 /* RAW_ERROR_COLLECTED */, { error: error });
    };
    var replayRequest = httpRequest || createHttpRequest(configuration.sessionReplayEndpointBuilder, SEGMENT_BYTES_LIMIT, reportError);
    var _a = startSegmentCollection(lifeCycle, configuration.applicationId, sessionManager, viewContexts, function (data, metadata, rawSegmentBytesCount) { return send(replayRequest, data, metadata, rawSegmentBytesCount); }, worker), addRecord = _a.addRecord, stopSegmentCollection = _a.stop;
    var _b = record({
        emit: addRecord,
        configuration: configuration,
        lifeCycle: lifeCycle,
    }), stopRecording = _b.stop, takeSubsequentFullSnapshot = _b.takeSubsequentFullSnapshot, flushMutations = _b.flushMutations;
    var unsubscribeViewEnded = lifeCycle.subscribe(4 /* VIEW_ENDED */, function () {
        flushMutations();
        addRecord({
            timestamp: timeStampNow(),
            type: RecordType.ViewEnd,
        });
    }).unsubscribe;
    var unsubscribeViewCreated = lifeCycle.subscribe(2 /* VIEW_CREATED */, function (view) {
        takeSubsequentFullSnapshot(view.startClocks.timeStamp);
    }).unsubscribe;
    return {
        stop: function () {
            unsubscribeViewEnded();
            unsubscribeViewCreated();
            stopRecording();
            stopSegmentCollection();
        },
    };
}
//# sourceMappingURL=startRecording.js.map