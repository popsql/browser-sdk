import { ErrorSource, initXhrObservable, initFetchObservable, computeStackTrace, toStackTraceString, monitor, noop, } from '@datadog/browser-core';
import { StatusType } from '../../logger';
export function startNetworkErrorCollection(configuration, lifeCycle) {
    if (!configuration.forwardErrorsToLogs) {
        return { stop: noop };
    }
    var xhrSubscription = initXhrObservable().subscribe(function (context) {
        if (context.state === 'complete') {
            handleCompleteRequest("xhr" /* XHR */, context);
        }
    });
    var fetchSubscription = initFetchObservable().subscribe(function (context) {
        if (context.state === 'complete') {
            handleCompleteRequest("fetch" /* FETCH */, context);
        }
    });
    function handleCompleteRequest(type, request) {
        if (!configuration.isIntakeUrl(request.url) && (isRejected(request) || isServerError(request))) {
            if ('xhr' in request) {
                computeXhrResponseData(request.xhr, configuration, onResponseDataAvailable);
            }
            else if (request.response) {
                computeFetchResponseText(request.response, configuration, onResponseDataAvailable);
            }
            else if (request.error) {
                computeFetchErrorText(request.error, configuration, onResponseDataAvailable);
            }
        }
        function onResponseDataAvailable(responseData) {
            lifeCycle.notify(0 /* RAW_LOG_COLLECTED */, {
                rawLogsEvent: {
                    message: "".concat(format(type), " error ").concat(request.method, " ").concat(request.url),
                    date: request.startClocks.timeStamp,
                    error: {
                        origin: ErrorSource.NETWORK,
                        stack: responseData || 'Failed to load',
                    },
                    http: {
                        method: request.method,
                        status_code: request.status,
                        url: request.url,
                    },
                    status: StatusType.error,
                    origin: ErrorSource.NETWORK,
                },
            });
        }
    }
    return {
        stop: function () {
            xhrSubscription.unsubscribe();
            fetchSubscription.unsubscribe();
        },
    };
}
// TODO: ideally, computeXhrResponseData should always call the callback with a string instead of
// `unknown`. But to keep backward compatibility, in the case of XHR with a `responseType` different
// than "text", the response data should be whatever `xhr.response` is. This is a bit confusing as
// Logs event 'stack' is expected to be a string. This should be changed in a future major version
// as it could be a breaking change.
export function computeXhrResponseData(xhr, configuration, callback) {
    if (typeof xhr.response === 'string') {
        callback(truncateResponseText(xhr.response, configuration));
    }
    else {
        callback(xhr.response);
    }
}
export function computeFetchErrorText(error, configuration, callback) {
    callback(truncateResponseText(toStackTraceString(computeStackTrace(error)), configuration));
}
export function computeFetchResponseText(response, configuration, callback) {
    if (!window.TextDecoder) {
        // If the browser doesn't support TextDecoder, let's read the whole response then truncate it.
        //
        // This should only be the case on early versions of Edge (before they migrated to Chromium).
        // Even if it could be possible to implement a workaround for the missing TextDecoder API (using
        // a Blob and FileReader), we found another issue preventing us from reading only the first
        // bytes from the response: contrary to other browsers, when reading from the cloned response,
        // if the original response gets canceled, the cloned response is also canceled and we can't
        // know about it.  In the following illustration, the promise returned by `reader.read()` may
        // never be fulfilled:
        //
        // fetch('/').then((response) => {
        //   const reader = response.clone().body.getReader()
        //   readMore()
        //   function readMore() {
        //     reader.read().then(
        //       (result) => {
        //         if (result.done) {
        //           console.log('done')
        //         } else {
        //           readMore()
        //         }
        //       },
        //       () => console.log('error')
        //     )
        //   }
        //   response.body.getReader().cancel()
        // })
        response
            .clone()
            .text()
            .then(monitor(function (text) { return callback(truncateResponseText(text, configuration)); }), monitor(function (error) { return callback("Unable to retrieve response: ".concat(error)); }));
    }
    else if (!response.body) {
        callback();
    }
    else {
        truncateResponseStream(response.clone().body, configuration.requestErrorResponseLengthLimit, function (error, responseText) {
            if (error) {
                callback("Unable to retrieve response: ".concat(error));
            }
            else {
                callback(responseText);
            }
        });
    }
}
function isRejected(request) {
    return request.status === 0 && request.responseType !== 'opaque';
}
function isServerError(request) {
    return request.status >= 500;
}
function truncateResponseText(responseText, configuration) {
    if (responseText.length > configuration.requestErrorResponseLengthLimit) {
        return "".concat(responseText.substring(0, configuration.requestErrorResponseLengthLimit), "...");
    }
    return responseText;
}
function format(type) {
    if ("xhr" /* XHR */ === type) {
        return 'XHR';
    }
    return 'Fetch';
}
function truncateResponseStream(stream, limit, callback) {
    readLimitedAmountOfBytes(stream, limit, function (error, bytes, limitExceeded) {
        if (error) {
            callback(error);
        }
        else {
            var responseText = new TextDecoder().decode(bytes);
            if (limitExceeded) {
                responseText += '...';
            }
            callback(undefined, responseText);
        }
    });
}
/**
 * Read bytes from a ReadableStream until at least `limit` bytes have been read (or until the end of
 * the stream). The callback is invoked with the at most `limit` bytes, and indicates that the limit
 * has been exceeded if more bytes were available.
 */
function readLimitedAmountOfBytes(stream, limit, callback) {
    var reader = stream.getReader();
    var chunks = [];
    var readBytesCount = 0;
    readMore();
    function readMore() {
        reader.read().then(monitor(function (result) {
            if (result.done) {
                onDone();
                return;
            }
            chunks.push(result.value);
            readBytesCount += result.value.length;
            if (readBytesCount > limit) {
                onDone();
            }
            else {
                readMore();
            }
        }), monitor(function (error) { return callback(error); }));
    }
    function onDone() {
        reader.cancel().catch(
        // we don't care if cancel fails, but we still need to catch the error to avoid reporting it
        // as an unhandled rejection
        noop);
        var completeBuffer;
        if (chunks.length === 1) {
            // optim: if the response is small enough to fit in a single buffer (provided by the browser), just
            // use it directly.
            completeBuffer = chunks[0];
        }
        else {
            // else, we need to copy buffers into a larger buffer to concatenate them.
            completeBuffer = new Uint8Array(readBytesCount);
            var offset_1 = 0;
            chunks.forEach(function (chunk) {
                completeBuffer.set(chunk, offset_1);
                offset_1 += chunk.length;
            });
        }
        callback(undefined, completeBuffer.slice(0, limit), completeBuffer.length > limit);
    }
}
//# sourceMappingURL=networkErrorCollection.js.map