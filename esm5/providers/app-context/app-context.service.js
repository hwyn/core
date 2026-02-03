import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injector, InjectorToken } from '@hwy-fm/di';
export var APP_CONTEXT = InjectorToken.get('APP_CONTEXT');
var AppContextService = /** @class */ (function () {
    function AppContextService(injector) {
        this.injector = injector;
    }
    AppContextService.prototype.getContext = function () {
        return this.injector.get(APP_CONTEXT) || {};
    };
    Object.defineProperty(AppContextService.prototype, "fetch", {
        get: function () {
            return this.getContext().fetch;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppContextService.prototype, "isMicro", {
        get: function () {
            return this.getContext().isMicro;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppContextService.prototype, "microManage", {
        get: function () {
            return this.getContext().useMicroManage();
        },
        enumerable: false,
        configurable: true
    });
    var _a;
    AppContextService = __decorate([
        __param(0, Inject(Injector)),
        __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
    ], AppContextService);
    return AppContextService;
}());
export { AppContextService };