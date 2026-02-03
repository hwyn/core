"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataTransform = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var utility_1 = require("../utility");
var token_1 = require("../token");
var MetadataTransform = /** @class */ (function () {
    function MetadataTransform() {
    }
    MetadataTransform.prototype.transform = function (_a) {
        var _b;
        var meta = _a.meta, key = _a.key, target = _a.target;
        return (_b = (0, utility_1.getValue)(this.metadata, meta.key)) !== null && _b !== void 0 ? _b : target === null || target === void 0 ? void 0 : target[key];
    };
    tslib_1.__decorate([
        (0, di_1.Inject)(token_1.APPLICATION_METADATA),
        tslib_1.__metadata("design:type", Object)
    ], MetadataTransform.prototype, "metadata", void 0);
    MetadataTransform = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], MetadataTransform);
    return MetadataTransform;
}());
exports.MetadataTransform = MetadataTransform;