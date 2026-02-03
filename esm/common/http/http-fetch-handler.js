var _a;
import { __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { from } from 'rxjs';
import { AppContextService } from "../../providers/app-context/index.js";
let HttpFetchHandler = class HttpFetchHandler {
    constructor(appContext) {
        this.fetch = appContext.fetch;
    }
    handle(req, params) {
        return from((typeof fetch !== 'undefined' ? fetch : this.fetch)(req, params));
    }
};
HttpFetchHandler = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof AppContextService !== "undefined" && AppContextService) === "function" ? _a : Object])
], HttpFetchHandler);
export { HttpFetchHandler };