import { assign, startsWith } from '@datadog/browser-core';
import { STABLE_ATTRIBUTES } from '@datadog/browser-rum-core';
import { NodePrivacyLevel, PRIVACY_ATTR_NAME, PRIVACY_ATTR_VALUE_HIDDEN, CENSORED_STRING_MARK, CENSORED_IMG_MARK, } from '../../constants';
import { NodeType } from '../../types';
import { getTextContent, shouldMaskNode, reducePrivacyLevel, getNodeSelfPrivacyLevel, MAX_ATTRIBUTE_VALUE_CHAR_LENGTH, } from './privacy';
import { getSerializedNodeId, setSerializedNodeId, getElementInputValue, switchToAbsoluteUrl, } from './serializationUtils';
import { forEach } from './utils';
export function serializeDocument(document, configuration, serializationContext) {
    // We are sure that Documents are never ignored, so this function never returns null
    return serializeNodeWithId(document, {
        serializationContext: serializationContext,
        parentNodePrivacyLevel: configuration.defaultPrivacyLevel,
        configuration: configuration,
    });
}
export function serializeNodeWithId(node, options) {
    var serializedNode = serializeNode(node, options);
    if (!serializedNode) {
        return null;
    }
    // Try to reuse the previous id
    var id = getSerializedNodeId(node) || generateNextId();
    var serializedNodeWithId = serializedNode;
    serializedNodeWithId.id = id;
    setSerializedNodeId(node, id);
    if (options.serializedNodeIds) {
        options.serializedNodeIds.add(id);
    }
    return serializedNodeWithId;
}
function serializeNode(node, options) {
    switch (node.nodeType) {
        case node.DOCUMENT_NODE:
            return serializeDocumentNode(node, options);
        case node.DOCUMENT_TYPE_NODE:
            return serializeDocumentTypeNode(node);
        case node.ELEMENT_NODE:
            return serializeElementNode(node, options);
        case node.TEXT_NODE:
            return serializeTextNode(node, options);
        case node.CDATA_SECTION_NODE:
            return serializeCDataNode();
    }
}
export function serializeDocumentNode(document, options) {
    return {
        type: NodeType.Document,
        childNodes: serializeChildNodes(document, options),
    };
}
function serializeDocumentTypeNode(documentType) {
    return {
        type: NodeType.DocumentType,
        name: documentType.name,
        publicId: documentType.publicId,
        systemId: documentType.systemId,
    };
}
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
export function serializeElementNode(element, options) {
    var _a;
    var tagName = getValidTagName(element.tagName);
    var isSVG = isSVGElement(element) || undefined;
    // For performance reason, we don't use getNodePrivacyLevel directly: we leverage the
    // parentNodePrivacyLevel option to avoid iterating over all parents
    var nodePrivacyLevel = reducePrivacyLevel(getNodeSelfPrivacyLevel(element), options.parentNodePrivacyLevel);
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        var _b = element.getBoundingClientRect(), width = _b.width, height = _b.height;
        return {
            type: NodeType.Element,
            tagName: tagName,
            attributes: (_a = {
                    rr_width: "".concat(width, "px"),
                    rr_height: "".concat(height, "px")
                },
                _a[PRIVACY_ATTR_NAME] = PRIVACY_ATTR_VALUE_HIDDEN,
                _a),
            childNodes: [],
            isSVG: isSVG,
        };
    }
    // Ignore Elements like Script and some Link, Metas
    if (nodePrivacyLevel === NodePrivacyLevel.IGNORE) {
        return;
    }
    var attributes = getAttributesForPrivacyLevel(element, nodePrivacyLevel, options);
    var childNodes = [];
    if (element.childNodes.length) {
        // OBJECT POOLING OPTIMIZATION:
        // We should not create a new object systematically as it could impact performances. Try to reuse
        // the same object as much as possible, and clone it only if we need to.
        var childNodesSerializationOptions = void 0;
        if (options.parentNodePrivacyLevel === nodePrivacyLevel && options.ignoreWhiteSpace === (tagName === 'head')) {
            childNodesSerializationOptions = options;
        }
        else {
            childNodesSerializationOptions = assign({}, options, {
                parentNodePrivacyLevel: nodePrivacyLevel,
                ignoreWhiteSpace: tagName === 'head',
            });
        }
        childNodes = serializeChildNodes(element, childNodesSerializationOptions);
    }
    return {
        type: NodeType.Element,
        tagName: tagName,
        attributes: attributes,
        childNodes: childNodes,
        isSVG: isSVG,
    };
}
/**
 * Text Nodes are dependant on Element nodes
 * Privacy levels are set on elements so we check the parentElement of a text node
 * for privacy level.
 */
function serializeTextNode(textNode, options) {
    var _a;
    // The parent node may not be a html element which has a tagName attribute.
    // So just let it be undefined which is ok in this use case.
    var parentTagName = (_a = textNode.parentElement) === null || _a === void 0 ? void 0 : _a.tagName;
    var textContent = getTextContent(textNode, options.ignoreWhiteSpace || false, options.parentNodePrivacyLevel);
    if (!textContent) {
        return;
    }
    return {
        type: NodeType.Text,
        textContent: textContent,
        isStyle: parentTagName === 'STYLE' ? true : undefined,
    };
}
function serializeCDataNode() {
    return {
        type: NodeType.CDATA,
        textContent: '',
    };
}
export function serializeChildNodes(node, options) {
    var result = [];
    forEach(node.childNodes, function (childNode) {
        var serializedChildNode = serializeNodeWithId(childNode, options);
        if (serializedChildNode) {
            result.push(serializedChildNode);
        }
    });
    return result;
}
export function serializeAttribute(element, nodePrivacyLevel, attributeName, configuration) {
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        // dup condition for direct access case
        return null;
    }
    var attributeValue = element.getAttribute(attributeName);
    if (nodePrivacyLevel === NodePrivacyLevel.MASK &&
        attributeName !== PRIVACY_ATTR_NAME &&
        !STABLE_ATTRIBUTES.includes(attributeName) &&
        attributeName !== configuration.actionNameAttribute) {
        var tagName = element.tagName;
        switch (attributeName) {
            // Mask Attribute text content
            case 'title':
            case 'alt':
            case 'placeholder':
                return CENSORED_STRING_MARK;
        }
        // mask image URLs
        if (tagName === 'IMG' || tagName === 'SOURCE') {
            if (attributeName === 'src' || attributeName === 'srcset') {
                return CENSORED_IMG_MARK;
            }
        }
        // mask <a> URLs
        if (tagName === 'A' && attributeName === 'href') {
            return CENSORED_STRING_MARK;
        }
        // mask data-* attributes
        if (attributeValue && startsWith(attributeName, 'data-')) {
            // Exception: it's safe to reveal the `${PRIVACY_ATTR_NAME}` attr
            return CENSORED_STRING_MARK;
        }
    }
    if (!attributeValue || typeof attributeValue !== 'string') {
        return attributeValue;
    }
    // Minimum Fix for customer.
    if (attributeValue.length > MAX_ATTRIBUTE_VALUE_CHAR_LENGTH && attributeValue.slice(0, 5) === 'data:') {
        return 'data:truncated';
    }
    return attributeValue;
}
var _nextId = 1;
function generateNextId() {
    return _nextId++;
}
var TAG_NAME_REGEX = /[^a-z1-6-_]/;
function getValidTagName(tagName) {
    var processedTagName = tagName.toLowerCase().trim();
    if (TAG_NAME_REGEX.test(processedTagName)) {
        // if the tag name is odd and we cannot extract
        // anything from the string, then we return a
        // generic div
        return 'div';
    }
    return processedTagName;
}
function getCssRulesString(s) {
    try {
        var rules = s.rules || s.cssRules;
        if (rules) {
            var styleSheetCssText = Array.from(rules, getCssRuleString).join('');
            return switchToAbsoluteUrl(styleSheetCssText, s.href);
        }
        return null;
    }
    catch (error) {
        return null;
    }
}
function getCssRuleString(rule) {
    return isCSSImportRule(rule) ? getCssRulesString(rule.styleSheet) || '' : rule.cssText;
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
function isSVGElement(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
function getAttributesForPrivacyLevel(element, nodePrivacyLevel, options) {
    var _a;
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return {};
    }
    var safeAttrs = {};
    var tagName = getValidTagName(element.tagName);
    var doc = element.ownerDocument;
    for (var i = 0; i < element.attributes.length; i += 1) {
        var attribute = element.attributes.item(i);
        var attributeName = attribute.name;
        var attributeValue = serializeAttribute(element, nodePrivacyLevel, attributeName, options.configuration);
        if (attributeValue !== null) {
            safeAttrs[attributeName] = attributeValue;
        }
    }
    if (element.value &&
        (tagName === 'textarea' || tagName === 'select' || tagName === 'option' || tagName === 'input')) {
        var formValue = getElementInputValue(element, nodePrivacyLevel);
        if (formValue !== undefined) {
            safeAttrs.value = formValue;
        }
    }
    /**
     * <Option> can be selected, which occurs if its `value` matches ancestor `<Select>.value`
     */
    if (tagName === 'option' && nodePrivacyLevel === NodePrivacyLevel.ALLOW) {
        // For privacy=`MASK`, all the values would be the same, so skip.
        var optionElement = element;
        if (optionElement.selected) {
            safeAttrs.selected = optionElement.selected;
        }
    }
    // remote css
    if (tagName === 'link') {
        var stylesheet = Array.from(doc.styleSheets).find(function (s) { return s.href === element.href; });
        var cssText = getCssRulesString(stylesheet);
        if (cssText && stylesheet) {
            delete safeAttrs.rel;
            delete safeAttrs.href;
            safeAttrs._cssText = cssText;
        }
    }
    // dynamic stylesheet
    if (tagName === 'style' &&
        element.sheet &&
        // TODO: Currently we only try to get dynamic stylesheet when it is an empty style element
        !(element.innerText || element.textContent || '').trim().length) {
        var cssText = getCssRulesString(element.sheet);
        if (cssText) {
            safeAttrs._cssText = cssText;
        }
    }
    /**
     * Forms: input[type=checkbox,radio]
     * The `checked` property for <input> is a little bit special:
     * 1. el.checked is a setter that returns if truthy.
     * 2. getAttribute returns the string value
     * getAttribute('checked') does not sync with `Element.checked`, so use JS property
     * NOTE: `checked` property exists on `HTMLInputElement`. For serializer assumptions, we check for type=radio|check.
     */
    var inputElement = element;
    if (tagName === 'input' && (inputElement.type === 'radio' || inputElement.type === 'checkbox')) {
        if (nodePrivacyLevel === NodePrivacyLevel.ALLOW) {
            safeAttrs.checked = !!inputElement.checked;
        }
        else if (shouldMaskNode(inputElement, nodePrivacyLevel)) {
            safeAttrs.checked = CENSORED_STRING_MARK;
        }
    }
    /**
     * Serialize the media playback state
     */
    if (tagName === 'audio' || tagName === 'video') {
        var mediaElement = element;
        safeAttrs.rr_mediaState = mediaElement.paused ? 'paused' : 'played';
    }
    /**
     * Serialize the scroll state for each element only for full snapshot
     */
    var scrollTop;
    var scrollLeft;
    var serializationContext = options.serializationContext;
    switch (serializationContext.status) {
        case 0 /* INITIAL_FULL_SNAPSHOT */:
            scrollTop = Math.round(element.scrollTop);
            scrollLeft = Math.round(element.scrollLeft);
            if (scrollTop || scrollLeft) {
                serializationContext.elementsScrollPositions.set(element, { scrollTop: scrollTop, scrollLeft: scrollLeft });
            }
            break;
        case 1 /* SUBSEQUENT_FULL_SNAPSHOT */:
            if (serializationContext.elementsScrollPositions.has(element)) {
                ;
                (_a = serializationContext.elementsScrollPositions.get(element), scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft);
            }
            break;
    }
    if (scrollLeft) {
        safeAttrs.rr_scrollLeft = scrollLeft;
    }
    if (scrollTop) {
        safeAttrs.rr_scrollTop = scrollTop;
    }
    return safeAttrs;
}
//# sourceMappingURL=serialize.js.map