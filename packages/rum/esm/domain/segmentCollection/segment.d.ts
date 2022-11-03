import type { BrowserRecord, BrowserSegmentMetadata, CreationReason, SegmentContext } from '../../types';
import type { DeflateWorker } from './deflateWorker';
export declare class Segment {
    private worker;
    isFlushed: boolean;
    readonly metadata: BrowserSegmentMetadata;
    private id;
    constructor(worker: DeflateWorker, context: SegmentContext, creationReason: CreationReason, initialRecord: BrowserRecord, onWrote: (compressedBytesCount: number) => void, onFlushed: (data: Uint8Array, rawBytesCount: number) => void);
    addRecord(record: BrowserRecord): void;
    flush(): void;
}
