var _a;
import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injector } from '@hwy-fm/di';
let JsonConfigService = class JsonConfigService {
    constructor(injector) {
        this.injector = injector;
    }
};
JsonConfigService = __decorate([
    __param(0, Inject(Injector)),
    __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
], JsonConfigService);
export { JsonConfigService };