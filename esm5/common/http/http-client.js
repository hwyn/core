import { __assign, __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { mergeMap } from 'rxjs/operators';
import { RequestMethod } from "./consts.js";
import { HttpHandler } from "./http-handler.js";
var HttpClient = /** @class */ (function () {
    function HttpClient(handler) {
        this.handler = handler;
    }
    HttpClient.prototype.request = function (method, req, params) {
        return this.handler.handle(req, __assign({ method: method }, params));
    };
    HttpClient.prototype.get = function (req, params) {
        return this.request(RequestMethod.GET, req, params).pipe(mergeMap(function (res) { return res.json(); }));
    };
    HttpClient.prototype.getText = function (req, params) {
        return this.request(RequestMethod.GET, req, params).pipe(mergeMap(function (res) { return res.text(); }));
    };
    HttpClient.prototype.post = function (req, params) {
        return this.request(RequestMethod.POST, req, params).pipe(mergeMap(function (res) { return res.json(); }));
    };
    HttpClient.prototype.put = function (req, params) {
        return this.request(RequestMethod.PUT, req, params).pipe(mergeMap(function (res) { return res.json(); }));
    };
    HttpClient.prototype.delete = function (req, params) {
        return this.request(RequestMethod.DELETE, req, params).pipe(mergeMap(function (res) { return res.json(); }));
    };
    var _a;
    HttpClient = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof HttpHandler !== "undefined" && HttpHandler) === "function" ? _a : Object])
    ], HttpClient);
    return HttpClient;
}());
export { HttpClient };