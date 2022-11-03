"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeNodeWithId = exports.NodePrivacyLevel = exports.PRIVACY_CLASS_HIDDEN = exports.PRIVACY_ATTR_VALUE_HIDDEN = exports.PRIVACY_ATTR_NAME = void 0;
var constants_1 = require("../constants");
Object.defineProperty(exports, "PRIVACY_ATTR_NAME", { enumerable: true, get: function () { return constants_1.PRIVACY_ATTR_NAME; } });
Object.defineProperty(exports, "PRIVACY_ATTR_VALUE_HIDDEN", { enumerable: true, get: function () { return constants_1.PRIVACY_ATTR_VALUE_HIDDEN; } });
Object.defineProperty(exports, "PRIVACY_CLASS_HIDDEN", { enumerable: true, get: function () { return constants_1.PRIVACY_CLASS_HIDDEN; } });
Object.defineProperty(exports, "NodePrivacyLevel", { enumerable: true, get: function () { return constants_1.NodePrivacyLevel; } });
__exportStar(require("../types"), exports);
var record_1 = require("../domain/record");
Object.defineProperty(exports, "serializeNodeWithId", { enumerable: true, get: function () { return record_1.serializeNodeWithId; } });
//# sourceMappingURL=internal.js.map