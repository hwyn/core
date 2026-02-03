import { __decorate, __metadata } from "tslib";
import { Inject, Injectable } from '@hwy-fm/di';
import { getValue } from "../utility/index.js";
import { APPLICATION_METADATA } from "../token/index.js";
let MetadataTransform = class MetadataTransform {
    transform({ meta, key, target }) {
        var _a;
        return (_a = getValue(this.metadata, meta.key)) !== null && _a !== void 0 ? _a : target === null || target === void 0 ? void 0 : target[key];
    }
};
__decorate([
    Inject(APPLICATION_METADATA),
    __metadata("design:type", Object)
], MetadataTransform.prototype, "metadata", void 0);
MetadataTransform = __decorate([
    Injectable()
], MetadataTransform);
export { MetadataTransform };