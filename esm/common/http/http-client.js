var _a;
import { __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { mergeMap } from 'rxjs/operators';
import { RequestMethod } from "./consts.js";
import { HttpHandler } from "./http-handler.js";
let HttpClient = class HttpClient {
    constructor(handler) {
        this.handler = handler;
    }
    request(method, req, params) {
        return this.handler.handle(req, Object.assign({ method }, params));
    }
    get(req, params) {
        return this.request(RequestMethod.GET, req, params).pipe(mergeMap((res) => res.json()));
    }
    getText(req, params) {
        return this.request(RequestMethod.GET, req, params).pipe(mergeMap((res) => res.text()));
    }
    post(req, params) {
        return this.request(RequestMethod.POST, req, params).pipe(mergeMap((res) => res.json()));
    }
    put(req, params) {
        return this.request(RequestMethod.PUT, req, params).pipe(mergeMap((res) => res.json()));
    }
    delete(req, params) {
        return this.request(RequestMethod.DELETE, req, params).pipe(mergeMap((res) => res.json()));
    }
};
HttpClient = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof HttpHandler !== "undefined" && HttpHandler) === "function" ? _a : Object])
], HttpClient);
export { HttpClient };