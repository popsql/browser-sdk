"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssEscape = exports.matchList = exports.removeDuplicates = exports.requestIdleCallback = exports.combine = exports.deepClone = exports.mergeInto = exports.getType = exports.runOnReadyState = exports.elementMatches = exports.addEventListeners = exports.addEventListener = exports.safeTruncate = exports.findCommaSeparatedValue = exports.getLinkElementOrigin = exports.getLocationOrigin = exports.getGlobalObject = exports.endsWith = exports.startsWith = exports.mapValues = exports.isEmptyObject = exports.objectEntries = exports.objectHasValue = exports.objectValues = exports.isNumber = exports.isPercentage = exports.findLast = exports.find = exports.arrayFrom = exports.includes = exports.jsonStringify = exports.noop = exports.round = exports.performDraw = exports.generateUUID = exports.shallowClone = exports.assign = exports.throttle = exports.ONE_MEBI_BYTE = exports.ONE_KIBI_BYTE = exports.ONE_YEAR = exports.ONE_DAY = exports.ONE_HOUR = exports.ONE_MINUTE = exports.ONE_SECOND = void 0;
var display_1 = require("./display");
var monitor_1 = require("./monitor");
exports.ONE_SECOND = 1000;
exports.ONE_MINUTE = 60 * exports.ONE_SECOND;
exports.ONE_HOUR = 60 * exports.ONE_MINUTE;
exports.ONE_DAY = 24 * exports.ONE_HOUR;
exports.ONE_YEAR = 365 * exports.ONE_DAY;
exports.ONE_KIBI_BYTE = 1024;
exports.ONE_MEBI_BYTE = 1024 * exports.ONE_KIBI_BYTE;
// use lodash API
function throttle(fn, wait, options) {
    var needLeadingExecution = options && options.leading !== undefined ? options.leading : true;
    var needTrailingExecution = options && options.trailing !== undefined ? options.trailing : true;
    var inWaitPeriod = false;
    var pendingExecutionWithParameters;
    var pendingTimeoutId;
    return {
        throttled: function () {
            var parameters = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                parameters[_i] = arguments[_i];
            }
            if (inWaitPeriod) {
                pendingExecutionWithParameters = parameters;
                return;
            }
            if (needLeadingExecution) {
                fn.apply(void 0, parameters);
            }
            else {
                pendingExecutionWithParameters = parameters;
            }
            inWaitPeriod = true;
            pendingTimeoutId = setTimeout(function () {
                if (needTrailingExecution && pendingExecutionWithParameters) {
                    fn.apply(void 0, pendingExecutionWithParameters);
                }
                inWaitPeriod = false;
                pendingExecutionWithParameters = undefined;
            }, wait);
        },
        cancel: function () {
            clearTimeout(pendingTimeoutId);
            inWaitPeriod = false;
            pendingExecutionWithParameters = undefined;
        },
    };
}
exports.throttle = throttle;
function assign(target) {
    var toAssign = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        toAssign[_i - 1] = arguments[_i];
    }
    toAssign.forEach(function (source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });
    return target;
}
exports.assign = assign;
function shallowClone(object) {
    return assign({}, object);
}
exports.shallowClone = shallowClone;
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
function generateUUID(placeholder) {
    return placeholder
        ? // eslint-disable-next-line  no-bitwise
            (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
        : "".concat(1e7, "-").concat(1e3, "-").concat(4e3, "-").concat(8e3, "-").concat(1e11).replace(/[018]/g, generateUUID);
}
exports.generateUUID = generateUUID;
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
function performDraw(threshold) {
    return threshold !== 0 && Math.random() * 100 <= threshold;
}
exports.performDraw = performDraw;
function round(num, decimals) {
    return +num.toFixed(decimals);
}
exports.round = round;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
exports.noop = noop;
/**
 * Custom implementation of JSON.stringify that ignores some toJSON methods. We need to do that
 * because some sites badly override toJSON on certain objects. Removing all toJSON methods from
 * nested values would be too costly, so we just detach them from the root value, and native classes
 * used to build JSON values (Array and Object).
 *
 * Note: this still assumes that JSON.stringify is correct.
 */
function jsonStringify(value, space) {
    if (typeof value !== 'object' || value === null) {
        return JSON.stringify(value);
    }
    // Note: The order matters here. We need to detach toJSON methods on parent classes before their
    // subclasses.
    var restoreObjectPrototypeToJson = detachToJsonMethod(Object.prototype);
    var restoreArrayPrototypeToJson = detachToJsonMethod(Array.prototype);
    var restoreValuePrototypeToJson = detachToJsonMethod(Object.getPrototypeOf(value));
    var restoreValueToJson = detachToJsonMethod(value);
    try {
        return JSON.stringify(value, getCyclicReplacer(), space);
    }
    catch (_a) {
        return '<error: unable to serialize object>';
    }
    finally {
        restoreObjectPrototypeToJson();
        restoreArrayPrototypeToJson();
        restoreValuePrototypeToJson();
        restoreValueToJson();
    }
}
exports.jsonStringify = jsonStringify;
function detachToJsonMethod(value) {
    var object = value;
    var objectToJson = object.toJSON;
    if (objectToJson) {
        delete object.toJSON;
        return function () {
            object.toJSON = objectToJson;
        };
    }
    return noop;
}
function includes(candidate, search) {
    return candidate.indexOf(search) !== -1;
}
exports.includes = includes;
function arrayFrom(arrayLike) {
    if (Array.from) {
        return Array.from(arrayLike);
    }
    var array = [];
    if (arrayLike instanceof Set) {
        arrayLike.forEach(function (item) { return array.push(item); });
    }
    else {
        for (var i = 0; i < arrayLike.length; i++) {
            array.push(arrayLike[i]);
        }
    }
    return array;
}
exports.arrayFrom = arrayFrom;
function find(array, predicate) {
    for (var i = 0; i < array.length; i += 1) {
        var item = array[i];
        if (predicate(item, i)) {
            return item;
        }
    }
    return undefined;
}
exports.find = find;
function findLast(array, predicate) {
    for (var i = array.length - 1; i >= 0; i -= 1) {
        var item = array[i];
        if (predicate(item, i, array)) {
            return item;
        }
    }
    return undefined;
}
exports.findLast = findLast;
function isPercentage(value) {
    return isNumber(value) && value >= 0 && value <= 100;
}
exports.isPercentage = isPercentage;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
function objectValues(object) {
    return Object.keys(object).map(function (key) { return object[key]; });
}
exports.objectValues = objectValues;
function objectHasValue(object, value) {
    return Object.keys(object).some(function (key) { return object[key] === value; });
}
exports.objectHasValue = objectHasValue;
function objectEntries(object) {
    return Object.keys(object).map(function (key) { return [key, object[key]]; });
}
exports.objectEntries = objectEntries;
function isEmptyObject(object) {
    return Object.keys(object).length === 0;
}
exports.isEmptyObject = isEmptyObject;
function mapValues(object, fn) {
    var newObject = {};
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var key = _a[_i];
        newObject[key] = fn(object[key]);
    }
    return newObject;
}
exports.mapValues = mapValues;
function startsWith(candidate, search) {
    return candidate.slice(0, search.length) === search;
}
exports.startsWith = startsWith;
function endsWith(candidate, search) {
    return candidate.slice(-search.length) === search;
}
exports.endsWith = endsWith;
/**
 * inspired by https://mathiasbynens.be/notes/globalthis
 */
function getGlobalObject() {
    if (typeof globalThis === 'object') {
        return globalThis;
    }
    Object.defineProperty(Object.prototype, '_dd_temp_', {
        get: function () {
            return this;
        },
        configurable: true,
    });
    // @ts-ignore _dd_temp is defined using defineProperty
    var globalObject = _dd_temp_;
    // @ts-ignore _dd_temp is defined using defineProperty
    delete Object.prototype._dd_temp_;
    if (typeof globalObject !== 'object') {
        // on safari _dd_temp_ is available on window but not globally
        // fallback on other browser globals check
        if (typeof self === 'object') {
            globalObject = self;
        }
        else if (typeof window === 'object') {
            globalObject = window;
        }
        else {
            globalObject = {};
        }
    }
    return globalObject;
}
exports.getGlobalObject = getGlobalObject;
function getLocationOrigin() {
    return getLinkElementOrigin(window.location);
}
exports.getLocationOrigin = getLocationOrigin;
/**
 * IE fallback
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 */
function getLinkElementOrigin(element) {
    if (element.origin) {
        return element.origin;
    }
    var sanitizedHost = element.host.replace(/(:80|:443)$/, '');
    return "".concat(element.protocol, "//").concat(sanitizedHost);
}
exports.getLinkElementOrigin = getLinkElementOrigin;
function findCommaSeparatedValue(rawString, name) {
    var regex = new RegExp("(?:^|;)\\s*".concat(name, "\\s*=\\s*([^;]+)"));
    var matches = regex.exec(rawString);
    return matches ? matches[1] : undefined;
}
exports.findCommaSeparatedValue = findCommaSeparatedValue;
function safeTruncate(candidate, length, suffix) {
    if (suffix === void 0) { suffix = ''; }
    var lastChar = candidate.charCodeAt(length - 1);
    var isLastCharSurrogatePair = lastChar >= 0xd800 && lastChar <= 0xdbff;
    var correctedLength = isLastCharSurrogatePair ? length + 1 : length;
    if (candidate.length <= correctedLength)
        return candidate;
    return "".concat(candidate.slice(0, correctedLength)).concat(suffix);
}
exports.safeTruncate = safeTruncate;
/**
 * Add an event listener to an event emitter object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 */
function addEventListener(emitter, event, listener, options) {
    return addEventListeners(emitter, [event], listener, options);
}
exports.addEventListener = addEventListener;
/**
 * Add event listeners to an event emitter object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 *
 * * with `once: true`, the listener will be called at most once, even if different events are listened
 */
function addEventListeners(emitter, events, listener, _a) {
    var _b = _a === void 0 ? {} : _a, once = _b.once, capture = _b.capture, passive = _b.passive;
    var wrappedListener = (0, monitor_1.monitor)(once
        ? function (event) {
            stop();
            listener(event);
        }
        : listener);
    var options = passive ? { capture: capture, passive: passive } : capture;
    events.forEach(function (event) { return emitter.addEventListener(event, wrappedListener, options); });
    var stop = function () { return events.forEach(function (event) { return emitter.removeEventListener(event, wrappedListener, options); }); };
    return {
        stop: stop,
    };
}
exports.addEventListeners = addEventListeners;
function elementMatches(element, selector) {
    if (element.matches) {
        return element.matches(selector);
    }
    // IE11 support
    if (element.msMatchesSelector) {
        return element.msMatchesSelector(selector);
    }
    return false;
}
exports.elementMatches = elementMatches;
function runOnReadyState(expectedReadyState, callback) {
    if (document.readyState === expectedReadyState || document.readyState === 'complete') {
        callback();
    }
    else {
        var eventName = expectedReadyState === 'complete' ? "load" /* LOAD */ : "DOMContentLoaded" /* DOM_CONTENT_LOADED */;
        addEventListener(window, eventName, callback, { once: true });
    }
}
exports.runOnReadyState = runOnReadyState;
/**
 * Similar to `typeof`, but distinguish plain objects from `null` and arrays
 */
function getType(value) {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    return typeof value;
}
exports.getType = getType;
function createCircularReferenceChecker() {
    // Using a weakmap instead of a weakset to support IE11
    var map = new WeakMap();
    return {
        hasAlreadyBeenSeen: function (value) {
            var has = map.has(value);
            if (!has) {
                map.set(value, true);
            }
            return has;
        },
    };
}
/**
 * Returns a replacer function that can be used with JSON.stringify
 * to remove cyclic references.
 */
function getCyclicReplacer() {
    var circularReferenceChecker = createCircularReferenceChecker();
    return function (_key, value) {
        var type = getType(value);
        if ((type === 'object' || type === 'array') && circularReferenceChecker.hasAlreadyBeenSeen(value)) {
            return '<warning: cyclic reference not serialized>';
        }
        return value;
    };
}
/**
 * Iterate over source and affect its sub values into destination, recursively.
 * If the source and destination can't be merged, return source.
 */
function mergeInto(destination, source, circularReferenceChecker) {
    if (circularReferenceChecker === void 0) { circularReferenceChecker = createCircularReferenceChecker(); }
    // ignore the source if it is undefined
    if (source === undefined) {
        return destination;
    }
    if (typeof source !== 'object' || source === null) {
        // primitive values - just return source
        return source;
    }
    else if (source instanceof Date) {
        return new Date(source.getTime());
    }
    else if (source instanceof RegExp) {
        var flags = source.flags ||
            // old browsers compatibility
            [
                source.global ? 'g' : '',
                source.ignoreCase ? 'i' : '',
                source.multiline ? 'm' : '',
                source.sticky ? 'y' : '',
                source.unicode ? 'u' : '',
            ].join('');
        return new RegExp(source.source, flags);
    }
    if (circularReferenceChecker.hasAlreadyBeenSeen(source)) {
        // remove circular references
        return undefined;
    }
    else if (Array.isArray(source)) {
        var merged_1 = Array.isArray(destination) ? destination : [];
        for (var i = 0; i < source.length; ++i) {
            merged_1[i] = mergeInto(merged_1[i], source[i], circularReferenceChecker);
        }
        return merged_1;
    }
    var merged = getType(destination) === 'object' ? destination : {};
    for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            merged[key] = mergeInto(merged[key], source[key], circularReferenceChecker);
        }
    }
    return merged;
}
exports.mergeInto = mergeInto;
/**
 * A simplistic implementation of a deep clone algorithm.
 * Caveats:
 * - It doesn't maintain prototype chains - don't use with instances of custom classes.
 * - It doesn't handle Map and Set
 */
function deepClone(value) {
    return mergeInto(undefined, value);
}
exports.deepClone = deepClone;
function combine() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var destination;
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        // Ignore any undefined or null sources.
        if (source === undefined || source === null) {
            continue;
        }
        destination = mergeInto(destination, source);
    }
    return destination;
}
exports.combine = combine;
function requestIdleCallback(callback, opts) {
    // Use 'requestIdleCallback' when available: it will throttle the mutation processing if the
    // browser is busy rendering frames (ex: when frames are below 60fps). When not available, the
    // fallback on 'requestAnimationFrame' will still ensure the mutations are processed after any
    // browser rendering process (Layout, Recalculate Style, etc.), so we can serialize DOM nodes
    // efficiently.
    if (window.requestIdleCallback) {
        var id_1 = window.requestIdleCallback((0, monitor_1.monitor)(callback), opts);
        return function () { return window.cancelIdleCallback(id_1); };
    }
    var id = window.requestAnimationFrame((0, monitor_1.monitor)(callback));
    return function () { return window.cancelAnimationFrame(id); };
}
exports.requestIdleCallback = requestIdleCallback;
function removeDuplicates(array) {
    var set = new Set();
    array.forEach(function (item) { return set.add(item); });
    return arrayFrom(set);
}
exports.removeDuplicates = removeDuplicates;
function matchList(list, value) {
    return list.some(function (item) {
        if (typeof item === 'function') {
            try {
                return item(value);
            }
            catch (e) {
                display_1.display.error(e);
                return false;
            }
        }
        if (item instanceof RegExp) {
            return item.test(value);
        }
        return item === value;
    });
}
exports.matchList = matchList;
// https://github.com/jquery/jquery/blob/a684e6ba836f7c553968d7d026ed7941e1a612d8/src/selector/escapeSelector.js
function cssEscape(str) {
    if (window.CSS && window.CSS.escape) {
        return window.CSS.escape(str);
    }
    // eslint-disable-next-line no-control-regex
    return str.replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, function (ch, asCodePoint) {
        if (asCodePoint) {
            // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
            if (ch === '\0') {
                return '\uFFFD';
            }
            // Control characters and (dependent upon position) numbers get escaped as code points
            return "".concat(ch.slice(0, -1), "\\").concat(ch.charCodeAt(ch.length - 1).toString(16), " ");
        }
        // Other potentially-special ASCII characters get backslash-escaped
        return "\\".concat(ch);
    });
}
exports.cssEscape = cssEscape;
//# sourceMappingURL=utils.js.map