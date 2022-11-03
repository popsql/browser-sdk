import { ONE_SECOND, addEventListener, monitor } from '@datadog/browser-core';
import { Segment } from './segment';
export var SEGMENT_DURATION_LIMIT = 30 * ONE_SECOND;
/**
 * beacon payload max queue size implementation is 64kb
 * ensure that we leave room for logs, rum and potential other users
 */
export var SEGMENT_BYTES_LIMIT = 60000;
// Segments are the main data structure for session replays. They contain context information used
// for indexing or UI needs, and a list of records (RRWeb 'events', renamed to avoid confusing
// namings). They are stored without any processing from the intake, and fetched one after the
// other while a session is being replayed. Their encoding (deflate) are carefully crafted to allow
// concatenating multiple segments together. Segments have a size overhead (metadata), so our goal is to
// build segments containing as many records as possible while complying with the various flush
// strategies to guarantee a good replay quality.
//
// When the recording starts, a segment is initially created.  The segment is flushed (finalized and
// sent) based on various events (non-exhaustive list):
//
// * the page visibility change or becomes to unload
// * the segment duration reaches a limit
// * the encoded segment bytes count reaches a limit
// * ...
//
// A segment cannot be created without its context.  If the RUM session ends and no session id is
// available when creating a new segment, records will be ignored, until the session is renewed and
// a new session id is available.
//
// Empty segments (segments with no record) aren't useful and should be ignored.
//
// To help investigate session replays issues, each segment is created with a "creation reason",
// indicating why the session has been created.
export function startSegmentCollection(lifeCycle, applicationId, sessionManager, viewContexts, send, worker) {
    return doStartSegmentCollection(lifeCycle, function () { return computeSegmentContext(applicationId, sessionManager, viewContexts); }, send, worker);
}
export function doStartSegmentCollection(lifeCycle, getSegmentContext, send, worker, emitter) {
    if (emitter === void 0) { emitter = window; }
    var state = {
        status: 0 /* WaitingForInitialRecord */,
        nextSegmentCreationReason: 'init',
    };
    var unsubscribeViewCreated = lifeCycle.subscribe(2 /* VIEW_CREATED */, function () {
        flushSegment('view_change');
    }).unsubscribe;
    var unsubscribeBeforeUnload = lifeCycle.subscribe(9 /* BEFORE_UNLOAD */, function () {
        flushSegment('before_unload');
    }).unsubscribe;
    var unsubscribeVisibilityChange = addEventListener(emitter, "visibilitychange" /* VISIBILITY_CHANGE */, function () {
        if (document.visibilityState === 'hidden') {
            flushSegment('visibility_hidden');
        }
    }, { capture: true }).stop;
    function flushSegment(nextSegmentCreationReason) {
        if (state.status === 1 /* SegmentPending */) {
            state.segment.flush();
            clearTimeout(state.expirationTimeoutId);
        }
        if (nextSegmentCreationReason) {
            state = {
                status: 0 /* WaitingForInitialRecord */,
                nextSegmentCreationReason: nextSegmentCreationReason,
            };
        }
        else {
            state = {
                status: 2 /* Stopped */,
            };
        }
    }
    function createNewSegment(creationReason, initialRecord) {
        var context = getSegmentContext();
        if (!context) {
            return;
        }
        var segment = new Segment(worker, context, creationReason, initialRecord, function (compressedSegmentBytesCount) {
            if (!segment.isFlushed && compressedSegmentBytesCount > SEGMENT_BYTES_LIMIT) {
                flushSegment('segment_bytes_limit');
            }
        }, function (data, rawSegmentBytesCount) {
            send(data, segment.metadata, rawSegmentBytesCount);
        });
        state = {
            status: 1 /* SegmentPending */,
            segment: segment,
            expirationTimeoutId: setTimeout(monitor(function () {
                flushSegment('segment_duration_limit');
            }), SEGMENT_DURATION_LIMIT),
        };
    }
    return {
        addRecord: function (record) {
            switch (state.status) {
                case 0 /* WaitingForInitialRecord */:
                    createNewSegment(state.nextSegmentCreationReason, record);
                    break;
                case 1 /* SegmentPending */:
                    state.segment.addRecord(record);
                    break;
            }
        },
        stop: function () {
            flushSegment();
            unsubscribeViewCreated();
            unsubscribeBeforeUnload();
            unsubscribeVisibilityChange();
        },
    };
}
export function computeSegmentContext(applicationId, sessionManager, viewContexts) {
    var session = sessionManager.findTrackedSession();
    var viewContext = viewContexts.findView();
    if (!session || !viewContext) {
        return undefined;
    }
    return {
        application: {
            id: applicationId,
        },
        session: {
            id: session.id,
        },
        view: {
            id: viewContext.id,
        },
    };
}
export function setSegmentBytesLimit(newSegmentBytesLimit) {
    if (newSegmentBytesLimit === void 0) { newSegmentBytesLimit = 60000; }
    SEGMENT_BYTES_LIMIT = newSegmentBytesLimit;
}
//# sourceMappingURL=segmentCollection.js.map