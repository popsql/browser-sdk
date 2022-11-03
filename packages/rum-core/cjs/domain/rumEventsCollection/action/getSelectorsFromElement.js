"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportScopeSelector = exports.getSelectorsFromElement = exports.STABLE_ATTRIBUTES = void 0;
var browser_core_1 = require("@datadog/browser-core");
var getActionNameFromElement_1 = require("./getActionNameFromElement");
/**
 * Stable attributes are attributes that are commonly used to identify parts of a UI (ex:
 * component). Those attribute values should not be generated randomly (hardcoded most of the time)
 * and stay the same across deploys. They are not necessarily unique across the document.
 */
exports.STABLE_ATTRIBUTES = [
    getActionNameFromElement_1.DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE,
    // Common test attributes (list provided by google recorder)
    'data-testid',
    'data-test',
    'data-qa',
    'data-cy',
    'data-test-id',
    'data-qa-id',
    'data-testing',
    // FullStory decorator attributes:
    'data-component',
    'data-element',
    'data-source-file',
];
function getSelectorsFromElement(element, actionNameAttribute) {
    var attributeSelectors = getStableAttributeSelectors();
    if (actionNameAttribute) {
        attributeSelectors = [function (element) { return getAttributeSelector(actionNameAttribute, element); }].concat(attributeSelectors);
    }
    var globallyUniqueSelectorStrategies = attributeSelectors.concat(getIDSelector);
    var uniqueAmongChildrenSelectorStrategies = attributeSelectors.concat([getClassSelector, getTagNameSelector]);
    return {
        selector: getSelectorFromElement(element, globallyUniqueSelectorStrategies, uniqueAmongChildrenSelectorStrategies),
        selector_combined: getSelectorFromElement(element, globallyUniqueSelectorStrategies, uniqueAmongChildrenSelectorStrategies, { useCombinedSelectors: true }),
        selector_stopping_when_unique: getSelectorFromElement(element, globallyUniqueSelectorStrategies.concat([getClassSelector, getTagNameSelector]), uniqueAmongChildrenSelectorStrategies),
        selector_all_together: getSelectorFromElement(element, globallyUniqueSelectorStrategies.concat([getClassSelector, getTagNameSelector]), uniqueAmongChildrenSelectorStrategies, { useCombinedSelectors: true }),
    };
}
exports.getSelectorsFromElement = getSelectorsFromElement;
function isGeneratedValue(value) {
    // To compute the "URL path group", the backend replaces every URL path parts as a question mark
    // if it thinks the part is an identifier. The condition it uses is to checks whether a digit is
    // present.
    //
    // Here, we use the same strategy: if a the value contains a digit, we consider it generated. This
    // strategy might be a bit naive and fail in some cases, but there are many fallbacks to generate
    // CSS selectors so it should be fine most of the time. We might want to allow customers to
    // provide their own `isGeneratedValue` at some point.
    return /[0-9]/.test(value);
}
function getSelectorFromElement(targetElement, globallyUniqueSelectorStrategies, uniqueAmongChildrenSelectorStrategies, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.useCombinedSelectors, useCombinedSelectors = _c === void 0 ? false : _c;
    var targetElementSelector = '';
    var element = targetElement;
    while (element && element.nodeName !== 'HTML') {
        var globallyUniqueSelector = findSelector(element, globallyUniqueSelectorStrategies, isSelectorUniqueGlobally, useCombinedSelectors ? targetElementSelector : undefined);
        if (globallyUniqueSelector) {
            return combineSelector(globallyUniqueSelector, targetElementSelector);
        }
        var uniqueSelectorAmongChildren = findSelector(element, uniqueAmongChildrenSelectorStrategies, isSelectorUniqueAmongSiblings, useCombinedSelectors ? targetElementSelector : undefined);
        targetElementSelector = combineSelector(uniqueSelectorAmongChildren || getPositionSelector(element) || getTagNameSelector(element), targetElementSelector);
        element = element.parentElement;
    }
    return targetElementSelector;
}
function getIDSelector(element) {
    if (element.id && !isGeneratedValue(element.id)) {
        return "#".concat((0, browser_core_1.cssEscape)(element.id));
    }
}
function getClassSelector(element) {
    if (element.tagName === 'BODY') {
        return;
    }
    if (element.classList.length > 0) {
        for (var i = 0; i < element.classList.length; i += 1) {
            var className = element.classList[i];
            if (isGeneratedValue(className)) {
                continue;
            }
            return "".concat(element.tagName, ".").concat((0, browser_core_1.cssEscape)(className));
        }
    }
}
function getTagNameSelector(element) {
    return element.tagName;
}
var stableAttributeSelectorsCache;
function getStableAttributeSelectors() {
    if (!stableAttributeSelectorsCache) {
        stableAttributeSelectorsCache = exports.STABLE_ATTRIBUTES.map(function (attribute) { return function (element) { return getAttributeSelector(attribute, element); }; });
    }
    return stableAttributeSelectorsCache;
}
function getAttributeSelector(attributeName, element) {
    if (element.hasAttribute(attributeName)) {
        return "".concat(element.tagName, "[").concat(attributeName, "=\"").concat((0, browser_core_1.cssEscape)(element.getAttribute(attributeName)), "\"]");
    }
}
function getPositionSelector(element) {
    var parent = element.parentElement;
    var sibling = parent.firstElementChild;
    var currentIndex = 0;
    var elementIndex;
    while (sibling) {
        if (sibling.tagName === element.tagName) {
            currentIndex += 1;
            if (sibling === element) {
                elementIndex = currentIndex;
            }
            if (elementIndex !== undefined && currentIndex > 1) {
                // Performance improvement: avoid iterating over all children, stop as soon as we are sure
                // the element is not alone
                break;
            }
        }
        sibling = sibling.nextElementSibling;
    }
    return currentIndex > 1 ? "".concat(element.tagName, ":nth-of-type(").concat(elementIndex, ")") : undefined;
}
function findSelector(element, selectorGetters, predicate, childSelector) {
    for (var _i = 0, selectorGetters_1 = selectorGetters; _i < selectorGetters_1.length; _i++) {
        var selectorGetter = selectorGetters_1[_i];
        var elementSelector = selectorGetter(element);
        var fullSelector = elementSelector && combineSelector(elementSelector, childSelector);
        if (fullSelector && predicate(element, fullSelector)) {
            return elementSelector;
        }
    }
}
/**
 * Check whether the selector is unique among the whole document.
 */
function isSelectorUniqueGlobally(element, selector) {
    return element.ownerDocument.querySelectorAll(selector).length === 1;
}
/**
 * Check whether the selector is unique among the element siblings. In other words, it returns true
 * if "ELEMENT_PARENT > SELECTOR" returns a single element.
 *
 * The result will be less accurate on browsers that don't support :scope (i. e. IE): it will check
 * for any element matching the selector contained in the parent (in other words,
 * "ELEMENT_PARENT SELECTOR" returns a single element), regardless of whether the selector is a
 * direct descendent of the element parent. This should not impact results too much: if it
 * inaccurately returns false, we'll just fall back to another strategy.
 */
function isSelectorUniqueAmongSiblings(element, selector) {
    return (element.parentElement.querySelectorAll(supportScopeSelector() ? combineSelector(':scope', selector) : selector)
        .length === 1);
}
function combineSelector(parent, child) {
    return child ? "".concat(parent, ">").concat(child) : parent;
}
var supportScopeSelectorCache;
function supportScopeSelector() {
    if (supportScopeSelectorCache === undefined) {
        try {
            document.querySelector(':scope');
            supportScopeSelectorCache = true;
        }
        catch (_a) {
            supportScopeSelectorCache = false;
        }
    }
    return supportScopeSelectorCache;
}
exports.supportScopeSelector = supportScopeSelector;
//# sourceMappingURL=getSelectorsFromElement.js.map