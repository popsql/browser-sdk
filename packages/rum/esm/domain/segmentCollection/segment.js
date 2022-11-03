import { addTelemetryDebug, assign, monitor } from '@datadog/browser-core';
import { RecordType } from '../../types';
import * as replayStats from '../replayStats';
var nextId = 0;
var Segment = /** @class */ (function () {
    function Segment(worker, context, creationReason, initialRecord, onWrote, onFlushed) {
        var _this = this;
        this.worker = worker;
        this.isFlushed = false;
        this.id = nextId++;
        var viewId = context.view.id;
        this.metadata = assign({
            start: initialRecord.timestamp,
            end: initialRecord.timestamp,
            creation_reason: creationReason,
            records_count: 1,
            has_full_snapshot: initialRecord.type === RecordType.FullSnapshot,
            index_in_view: replayStats.getSegmentsCount(viewId),
            source: 'browser',
        }, context);
        replayStats.addSegment(viewId);
        replayStats.addRecord(viewId);
        var listener = monitor(function (_a) {
            var data = _a.data;
            if (data.type === 'errored' || data.type === 'initialized') {
                return;
            }
            if (data.id === _this.id) {
                replayStats.addWroteData(viewId, data.additionalBytesCount);
                if (data.type === 'flushed') {
                    onFlushed(data.result, data.rawBytesCount);
                    worker.removeEventListener('message', listener);
                }
                else {
                    onWrote(data.compressedBytesCount);
                }
            }
            else if (data.id > _this.id) {
                // Messages should be received in the same order as they are sent, so if we receive a
                // message with an id superior to this Segment instance id, we know that another, more
                // recent Segment instance is being used.
                //
                // In theory, a "flush" response should have been received at this point, so the listener
                // should already have been removed. But if something goes wrong and we didn't receive a
                // "flush" response, remove the listener to avoid any leak, and send a monitor message to
                // help investigate the issue.
                worker.removeEventListener('message', listener);
                addTelemetryDebug("Segment did not receive a 'flush' response before being replaced.");
            }
        });
        worker.addEventListener('message', listener);
        this.worker.postMessage({ data: "{\"records\":[".concat(JSON.stringify(initialRecord)), id: this.id, action: 'write' });
    }
    Segment.prototype.addRecord = function (record) {
        var _a;
        this.metadata.start = Math.min(this.metadata.start, record.timestamp);
        this.metadata.end = Math.max(this.metadata.end, record.timestamp);
        this.metadata.records_count += 1;
        replayStats.addRecord(this.metadata.view.id);
        (_a = this.metadata).has_full_snapshot || (_a.has_full_snapshot = record.type === RecordType.FullSnapshot);
        this.worker.postMessage({ data: ",".concat(JSON.stringify(record)), id: this.id, action: 'write' });
    };
    Segment.prototype.flush = function () {
        this.worker.postMessage({
            data: "],".concat(JSON.stringify(this.metadata).slice(1), "\n"),
            id: this.id,
            action: 'flush',
        });
        this.isFlushed = true;
    };
    return Segment;
}());
export { Segment };
//# sourceMappingURL=segment.js.map