"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpFetchHandler = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var rxjs_1 = require("rxjs");
var app_context_1 = require("../../providers/app-context");
var HttpFetchHandler = /** @class */ (function () {
    function HttpFetchHandler(appContext) {
        this.fetch = appContext.fetch;
    }
    HttpFetchHandler.prototype.handle = function (req, params) {
        return (0, rxjs_1.from)((typeof fetch !== 'undefined' ? fetch : this.fetch)(req, params));
    };
    var _a;
    HttpFetchHandler = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_context_1.AppContextService !== "undefined" && app_context_1.AppContextService) === "function" ? _a : Object])
    ], HttpFetchHandler);
    return HttpFetchHandler;
}());
exports.HttpFetchHandler = HttpFetchHandler;