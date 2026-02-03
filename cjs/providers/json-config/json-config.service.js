"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonConfigService = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var JsonConfigService = /** @class */ (function () {
    function JsonConfigService(injector) {
        this.injector = injector;
    }
    var _a;
    JsonConfigService = tslib_1.__decorate([
        tslib_1.__param(0, (0, di_1.Inject)(di_1.Injector)),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _a : Object])
    ], JsonConfigService);
    return JsonConfigService;
}());
exports.JsonConfigService = JsonConfigService;