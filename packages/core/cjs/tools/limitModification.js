"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitModification = void 0;
var utils_1 = require("./utils");
/**
 * Current limitation:
 * - field path do not support array, 'a.b.c' only
 */
function limitModification(object, modifiableFieldPaths, modifier) {
    var clone = (0, utils_1.deepClone)(object);
    var result = modifier(clone);
    modifiableFieldPaths.forEach(function (path) {
        var originalValue = get(object, path);
        var newValue = get(clone, path);
        var originalType = (0, utils_1.getType)(originalValue);
        var newType = (0, utils_1.getType)(newValue);
        if (newType === originalType) {
            set(object, path, newValue);
        }
        else if (originalType === 'object' && (newType === 'undefined' || newType === 'null')) {
            set(object, path, {});
        }
    });
    return result;
}
exports.limitModification = limitModification;
function get(object, path) {
    var current = object;
    for (var _i = 0, _a = path.split('.'); _i < _a.length; _i++) {
        var field = _a[_i];
        if (!isValidObjectContaining(current, field)) {
            return;
        }
        current = current[field];
    }
    return current;
}
function set(object, path, value) {
    var current = object;
    var fields = path.split('.');
    for (var i = 0; i < fields.length; i += 1) {
        var field = fields[i];
        if (!isValidObjectContaining(current, field)) {
            return;
        }
        if (i !== fields.length - 1) {
            current = current[field];
        }
        else {
            current[field] = value;
        }
    }
}
function isValidObjectContaining(object, field) {
    return typeof object === 'object' && object !== null && Object.prototype.hasOwnProperty.call(object, field);
}
//# sourceMappingURL=limitModification.js.map