import { __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { from } from 'rxjs';
import { AppContextService } from "../../providers/app-context/index.js";
var HttpFetchHandler = /** @class */ (function () {
    function HttpFetchHandler(appContext) {
        this.fetch = appContext.fetch;
    }
    HttpFetchHandler.prototype.handle = function (req, params) {
        return from((typeof fetch !== 'undefined' ? fetch : this.fetch)(req, params));
    };
    var _a;
    HttpFetchHandler = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof AppContextService !== "undefined" && AppContextService) === "function" ? _a : Object])
    ], HttpFetchHandler);
    return HttpFetchHandler;
}());
export { HttpFetchHandler };