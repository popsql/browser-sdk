import type { HttpRequest } from '@datadog/browser-core';
import type { BrowserSegmentMetadata } from '../types';
export declare function send(httpRequest: HttpRequest, data: Uint8Array, metadata: BrowserSegmentMetadata, rawSegmentBytesCount: number): void;
export declare function toFormEntries(input: object, onEntry: (key: string, value: string) => void, prefix?: string): void;
