import type { NodePrivacyLevel } from '../../constants';
export declare type NodeWithSerializedNode = Node & {
    s: 'Node with serialized node';
};
export declare function hasSerializedNode(node: Node): node is NodeWithSerializedNode;
export declare function nodeAndAncestorsHaveSerializedNode(node: Node): node is NodeWithSerializedNode;
export declare function getSerializedNodeId(node: NodeWithSerializedNode): number;
export declare function getSerializedNodeId(node: Node): number | undefined;
export declare function setSerializedNodeId(node: Node, serializeNodeId: number): void;
/**
 * Get the element "value" to be serialized as an attribute or an input update record. It respects
 * the input privacy mode of the element.
 * PERFROMANCE OPTIMIZATION: Assumes that privacy level `HIDDEN` is never encountered because of earlier checks.
 */
export declare function getElementInputValue(element: Element, nodePrivacyLevel: NodePrivacyLevel): string | undefined;
export declare const URL_IN_CSS_REF: RegExp;
export declare const ABSOLUTE_URL: RegExp;
export declare const DATA_URI: RegExp;
export declare function switchToAbsoluteUrl(cssText: string, cssHref: string | null): string;
export declare function makeUrlAbsolute(url: string, baseUrl: string): string;
