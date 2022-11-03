import type { Context } from '../tools/context';
import type { HttpRequest } from './httpRequest';
export declare class Batch {
    private request;
    private batchMessagesLimit;
    private batchBytesLimit;
    private messageBytesLimit;
    private flushTimeout;
    private beforeUnloadCallback;
    private pushOnlyBuffer;
    private upsertBuffer;
    private bufferBytesCount;
    private bufferMessagesCount;
    constructor(request: HttpRequest, batchMessagesLimit: number, batchBytesLimit: number, messageBytesLimit: number, flushTimeout: number, beforeUnloadCallback?: () => void);
    add(message: Context): void;
    upsert(message: Context, key: string): void;
    flush(sendFn?: (payload: import("./httpRequest").Payload) => void): void;
    flushOnExit(): void;
    computeBytesCount(candidate: string): number;
    private addOrUpdate;
    private process;
    private push;
    private remove;
    private hasMessageFor;
    private willReachedBytesLimitWith;
    private isFull;
    private flushPeriodically;
    private setupFlushOnExit;
}
