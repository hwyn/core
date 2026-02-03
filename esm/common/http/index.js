var _a, _b;
import { __decorate, __metadata } from "tslib";
import { Injectable, Injector } from '@hwy-fm/di';
import { HTTP_INTERCEPTORS } from "../../token/index.js";
import { HttpFetchHandler } from "./http-fetch-handler.js";
import { HttpInterceptHandler } from "./http-intercept-handler.js";
export { HttpClient } from "./http-client.js";
export { HttpFetchHandler } from "./http-fetch-handler.js";
export { HttpHandler } from "./http-handler.js";
export { createResponse } from "./util.js";
let HttpInterceptingHandler = class HttpInterceptingHandler {
    constructor(fetchHandler, injector) {
        this.fetchHandler = fetchHandler;
        this.injector = injector;
    }
    handle(req, params) {
        if (!this.chain) {
            const interceptors = this.injector.get(HTTP_INTERCEPTORS) || [];
            this.chain = interceptors.reduceRight((next, interceptor) => new HttpInterceptHandler(next, interceptor), this.fetchHandler);
        }
        return this.chain.handle(req, params);
    }
};
HttpInterceptingHandler = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof HttpFetchHandler !== "undefined" && HttpFetchHandler) === "function" ? _a : Object, typeof (_b = typeof Injector !== "undefined" && Injector) === "function" ? _b : Object])
], HttpInterceptingHandler);
export { HttpInterceptingHandler };