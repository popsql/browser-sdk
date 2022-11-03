import type { BrowserIncrementalData, BrowserIncrementalSnapshotRecord } from '../../types';
export declare function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent;
export declare function forEach<List extends {
    [index: number]: any;
}>(list: List, callback: (value: List[number], index: number, parent: List) => void): void;
export declare function assembleIncrementalSnapshot<Data extends BrowserIncrementalData>(source: Data['source'], data: Omit<Data, 'source'>): BrowserIncrementalSnapshotRecord;
export declare function getPathToNestedCSSRule(rule: CSSRule): number[] | undefined;
