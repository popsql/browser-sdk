import type { RumConfiguration } from '@datadog/browser-rum-core';
import { NodePrivacyLevel } from '../../constants';
import type { SerializedNodeWithId, DocumentNode, ElementNode } from '../../types';
import type { ElementsScrollPositions } from './elementsScrollPositions';
declare type ParentNodePrivacyLevel = typeof NodePrivacyLevel.ALLOW | typeof NodePrivacyLevel.MASK | typeof NodePrivacyLevel.MASK_USER_INPUT;
export declare const enum SerializationContextStatus {
    INITIAL_FULL_SNAPSHOT = 0,
    SUBSEQUENT_FULL_SNAPSHOT = 1,
    MUTATION = 2
}
export declare type SerializationContext = {
    status: SerializationContextStatus.MUTATION;
} | {
    status: SerializationContextStatus.INITIAL_FULL_SNAPSHOT;
    elementsScrollPositions: ElementsScrollPositions;
} | {
    status: SerializationContextStatus.SUBSEQUENT_FULL_SNAPSHOT;
    elementsScrollPositions: ElementsScrollPositions;
};
export interface SerializeOptions {
    serializedNodeIds?: Set<number>;
    ignoreWhiteSpace?: boolean;
    parentNodePrivacyLevel: ParentNodePrivacyLevel;
    serializationContext: SerializationContext;
    configuration: RumConfiguration;
}
export declare function serializeDocument(document: Document, configuration: RumConfiguration, serializationContext: SerializationContext): SerializedNodeWithId;
export declare function serializeNodeWithId(node: Node, options: SerializeOptions): SerializedNodeWithId | null;
export declare function serializeDocumentNode(document: Document, options: SerializeOptions): DocumentNode;
/**
 * Serializing Element nodes involves capturing:
 * 1. HTML ATTRIBUTES:
 * 2. JS STATE:
 * - scroll offsets
 * - Form fields (input value, checkbox checked, option selection, range)
 * - Canvas state,
 * - Media (video/audio) play mode + currentTime
 * - iframe contents
 * - webcomponents
 * 3. CUSTOM PROPERTIES:
 * - height+width for when `hidden` to cover the element
 * 4. EXCLUDED INTERACTION STATE:
 * - focus (possible, but not worth perf impact)
 * - hover (tracked only via mouse activity)
 * - fullscreen mode
 */
export declare function serializeElementNode(element: Element, options: SerializeOptions): ElementNode | undefined;
export declare function serializeChildNodes(node: Node, options: SerializeOptions): SerializedNodeWithId[];
export declare function serializeAttribute(element: Element, nodePrivacyLevel: NodePrivacyLevel, attributeName: string, configuration: RumConfiguration): string | number | boolean | null;
export {};
