/**
 * Get the action name from the attribute 'data-dd-action-name' on the element or any of its parent.
 * It can also be retrieved from a user defined attribute.
 */
export declare const DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE = "data-dd-action-name";
export declare function getActionNameFromElement(element: Element, userProgrammaticAttribute?: string): string;
