import { __decorate, __metadata } from "tslib";
import { Inject, Injectable } from '@hwy-fm/di';
import { getValue } from "../utility/index.js";
import { APPLICATION_METADATA } from "../token/index.js";
var MetadataTransform = /** @class */ (function () {
    function MetadataTransform() {
    }
    MetadataTransform.prototype.transform = function (_a) {
        var _b;
        var meta = _a.meta, key = _a.key, target = _a.target;
        return (_b = getValue(this.metadata, meta.key)) !== null && _b !== void 0 ? _b : target === null || target === void 0 ? void 0 : target[key];
    };
    __decorate([
        Inject(APPLICATION_METADATA),
        __metadata("design:type", Object)
    ], MetadataTransform.prototype, "metadata", void 0);
    MetadataTransform = __decorate([
        Injectable()
    ], MetadataTransform);
    return MetadataTransform;
}());
export { MetadataTransform };