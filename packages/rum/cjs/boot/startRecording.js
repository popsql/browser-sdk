"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRecording = void 0;
var browser_core_1 = require("@datadog/browser-core");
var record_1 = require("../domain/record");
var segmentCollection_1 = require("../domain/segmentCollection");
var send_1 = require("../transport/send");
var types_1 = require("../types");
function startRecording(lifeCycle, configuration, sessionManager, viewContexts, worker, httpRequest) {
    var reportError = function (error) {
        lifeCycle.notify(12 /* RAW_ERROR_COLLECTED */, { error: error });
    };
    var replayRequest = httpRequest || (0, browser_core_1.createHttpRequest)(configuration.sessionReplayEndpointBuilder, segmentCollection_1.SEGMENT_BYTES_LIMIT, reportError);
    var _a = (0, segmentCollection_1.startSegmentCollection)(lifeCycle, configuration.applicationId, sessionManager, viewContexts, function (data, metadata, rawSegmentBytesCount) { return (0, send_1.send)(replayRequest, data, metadata, rawSegmentBytesCount); }, worker), addRecord = _a.addRecord, stopSegmentCollection = _a.stop;
    var _b = (0, record_1.record)({
        emit: addRecord,
        configuration: configuration,
        lifeCycle: lifeCycle,
    }), stopRecording = _b.stop, takeSubsequentFullSnapshot = _b.takeSubsequentFullSnapshot, flushMutations = _b.flushMutations;
    var unsubscribeViewEnded = lifeCycle.subscribe(4 /* VIEW_ENDED */, function () {
        flushMutations();
        addRecord({
            timestamp: (0, browser_core_1.timeStampNow)(),
            type: types_1.RecordType.ViewEnd,
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
exports.startRecording = startRecording;
//# sourceMappingURL=startRecording.js.map