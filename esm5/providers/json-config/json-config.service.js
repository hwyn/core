import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injector } from '@hwy-fm/di';
var JsonConfigService = /** @class */ (function () {
    function JsonConfigService(injector) {
        this.injector = injector;
    }
    var _a;
    JsonConfigService = __decorate([
        __param(0, Inject(Injector)),
        __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
    ], JsonConfigService);
    return JsonConfigService;
}());
export { JsonConfigService };