import { display } from '../tools/display';
import { addEventListener, jsonStringify, noop, objectValues } from '../tools/utils';
import { monitor } from '../tools/monitor';
// https://en.wikipedia.org/wiki/UTF-8
// eslint-disable-next-line no-control-regex
var HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;
var Batch = /** @class */ (function () {
    function Batch(request, batchMessagesLimit, batchBytesLimit, messageBytesLimit, flushTimeout, beforeUnloadCallback) {
        if (beforeUnloadCallback === void 0) { beforeUnloadCallback = noop; }
        this.request = request;
        this.batchMessagesLimit = batchMessagesLimit;
        this.batchBytesLimit = batchBytesLimit;
        this.messageBytesLimit = messageBytesLimit;
        this.flushTimeout = flushTimeout;
        this.beforeUnloadCallback = beforeUnloadCallback;
        this.pushOnlyBuffer = [];
        this.upsertBuffer = {};
        this.bufferBytesCount = 0;
        this.bufferMessagesCount = 0;
        this.setupFlushOnExit();
        this.flushPeriodically();
    }
    Batch.prototype.add = function (message) {
        this.addOrUpdate(message);
    };
    Batch.prototype.upsert = function (message, key) {
        this.addOrUpdate(message, key);
    };
    Batch.prototype.flush = function (sendFn) {
        if (sendFn === void 0) { sendFn = this.request.send; }
        if (this.bufferMessagesCount !== 0) {
            var messages = this.pushOnlyBuffer.concat(objectValues(this.upsertBuffer));
            var bytesCount = this.bufferBytesCount;
            this.pushOnlyBuffer = [];
            this.upsertBuffer = {};
            this.bufferBytesCount = 0;
            this.bufferMessagesCount = 0;
            sendFn({ data: messages.join('\n'), bytesCount: bytesCount });
        }
    };
    Batch.prototype.flushOnExit = function () {
        this.flush(this.request.sendOnExit);
    };
    Batch.prototype.computeBytesCount = function (candidate) {
        // Accurate bytes count computations can degrade performances when there is a lot of events to process
        if (!HAS_MULTI_BYTES_CHARACTERS.test(candidate)) {
            return candidate.length;
        }
        if (window.TextEncoder !== undefined) {
            return new TextEncoder().encode(candidate).length;
        }
        return new Blob([candidate]).size;
    };
    Batch.prototype.addOrUpdate = function (message, key) {
        var _a = this.process(message), processedMessage = _a.processedMessage, messageBytesCount = _a.messageBytesCount;
        if (messageBytesCount >= this.messageBytesLimit) {
            display.warn("Discarded a message whose size was bigger than the maximum allowed size ".concat(this.messageBytesLimit, "KB."));
            return;
        }
        if (this.hasMessageFor(key)) {
            this.remove(key);
        }
        if (this.willReachedBytesLimitWith(messageBytesCount)) {
            this.flush();
        }
        this.push(processedMessage, messageBytesCount, key);
        if (this.isFull()) {
            this.flush();
        }
    };
    Batch.prototype.process = function (message) {
        var processedMessage = jsonStringify(message);
        var messageBytesCount = this.computeBytesCount(processedMessage);
        return { processedMessage: processedMessage, messageBytesCount: messageBytesCount };
    };
    Batch.prototype.push = function (processedMessage, messageBytesCount, key) {
        if (this.bufferMessagesCount > 0) {
            // \n separator at serialization
            this.bufferBytesCount += 1;
        }
        if (key !== undefined) {
            this.upsertBuffer[key] = processedMessage;
        }
        else {
            this.pushOnlyBuffer.push(processedMessage);
        }
        this.bufferBytesCount += messageBytesCount;
        this.bufferMessagesCount += 1;
    };
    Batch.prototype.remove = function (key) {
        var removedMessage = this.upsertBuffer[key];
        delete this.upsertBuffer[key];
        var messageBytesCount = this.computeBytesCount(removedMessage);
        this.bufferBytesCount -= messageBytesCount;
        this.bufferMessagesCount -= 1;
        if (this.bufferMessagesCount > 0) {
            this.bufferBytesCount -= 1;
        }
    };
    Batch.prototype.hasMessageFor = function (key) {
        return key !== undefined && this.upsertBuffer[key] !== undefined;
    };
    Batch.prototype.willReachedBytesLimitWith = function (messageBytesCount) {
        // byte of the separator at the end of the message
        return this.bufferBytesCount + messageBytesCount + 1 >= this.batchBytesLimit;
    };
    Batch.prototype.isFull = function () {
        return this.bufferMessagesCount === this.batchMessagesLimit || this.bufferBytesCount >= this.batchBytesLimit;
    };
    Batch.prototype.flushPeriodically = function () {
        var _this = this;
        setTimeout(monitor(function () {
            _this.flush();
            _this.flushPeriodically();
        }), this.flushTimeout);
    };
    Batch.prototype.setupFlushOnExit = function () {
        var _this = this;
        /**
         * With sendBeacon, requests are guaranteed to be successfully sent during document unload
         */
        // @ts-ignore this function is not always defined
        if (navigator.sendBeacon) {
            /**
             * beforeunload is called before visibilitychange
             * register first to be sure to be called before flush on beforeunload
             * caveat: unload can still be canceled by another listener
             */
            addEventListener(window, "beforeunload" /* BEFORE_UNLOAD */, this.beforeUnloadCallback);
            /**
             * Only event that guarantee to fire on mobile devices when the page transitions to background state
             * (e.g. when user switches to a different application, goes to homescreen, etc), or is being unloaded.
             */
            addEventListener(document, "visibilitychange" /* VISIBILITY_CHANGE */, function () {
                if (document.visibilityState === 'hidden') {
                    _this.flushOnExit();
                }
            });
            /**
             * Safari does not support yet to send a request during:
             * - a visibility change during doc unload (cf: https://bugs.webkit.org/show_bug.cgi?id=194897)
             * - a page hide transition (cf: https://bugs.webkit.org/show_bug.cgi?id=188329)
             */
            addEventListener(window, "beforeunload" /* BEFORE_UNLOAD */, function () { return _this.flushOnExit(); });
        }
    };
    return Batch;
}());
export { Batch };
//# sourceMappingURL=batch.js.map