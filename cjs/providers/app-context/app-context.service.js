"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContextService = exports.APP_CONTEXT = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
exports.APP_CONTEXT = di_1.InjectorToken.get('APP_CONTEXT');
var AppContextService = /** @class */ (function () {
    function AppContextService(injector) {
        this.injector = injector;
    }
    AppContextService.prototype.getContext = function () {
        return this.injector.get(exports.APP_CONTEXT) || {};
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
    AppContextService = tslib_1.__decorate([
        tslib_1.__param(0, (0, di_1.Inject)(di_1.Injector)),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _a : Object])
    ], AppContextService);
    return AppContextService;
}());
exports.AppContextService = AppContextService;