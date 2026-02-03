"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var operators_1 = require("rxjs/operators");
var consts_1 = require("./consts");
var http_handler_1 = require("./http-handler");
var HttpClient = /** @class */ (function () {
    function HttpClient(handler) {
        this.handler = handler;
    }
    HttpClient.prototype.request = function (method, req, params) {
        return this.handler.handle(req, tslib_1.__assign({ method: method }, params));
    };
    HttpClient.prototype.get = function (req, params) {
        return this.request(consts_1.RequestMethod.GET, req, params).pipe((0, operators_1.mergeMap)(function (res) { return res.json(); }));
    };
    HttpClient.prototype.getText = function (req, params) {
        return this.request(consts_1.RequestMethod.GET, req, params).pipe((0, operators_1.mergeMap)(function (res) { return res.text(); }));
    };
    HttpClient.prototype.post = function (req, params) {
        return this.request(consts_1.RequestMethod.POST, req, params).pipe((0, operators_1.mergeMap)(function (res) { return res.json(); }));
    };
    HttpClient.prototype.put = function (req, params) {
        return this.request(consts_1.RequestMethod.PUT, req, params).pipe((0, operators_1.mergeMap)(function (res) { return res.json(); }));
    };
    HttpClient.prototype.delete = function (req, params) {
        return this.request(consts_1.RequestMethod.DELETE, req, params).pipe((0, operators_1.mergeMap)(function (res) { return res.json(); }));
    };
    var _a;
    HttpClient = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof http_handler_1.HttpHandler !== "undefined" && http_handler_1.HttpHandler) === "function" ? _a : Object])
    ], HttpClient);
    return HttpClient;
}());
exports.HttpClient = HttpClient;