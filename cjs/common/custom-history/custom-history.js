"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomHistory = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var token_1 = require("../../token");
var router_1 = require("./router");
var CustomHistory = /** @class */ (function () {
    function CustomHistory(injector) {
        this.injector = injector;
        this.activeRoute = new rxjs_1.Subject().pipe((0, operators_1.shareReplay)(1));
        this.pushRoute = new rxjs_1.Subject();
        this.cancelRoute = new rxjs_1.Subject();
        this.history = this.injector.get(token_1.HISTORY);
        this.router = new router_1.Router(injector, this.injector.get(token_1.ROUTER_CONFIG));
        this.unListen = this.history.listen(this.listener.bind(this));
    }
    CustomHistory.prototype.loadRouter = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.pushRoute.next(url);
                return [2 /*return*/, this.resolveIntercept(this.parsePath(url))];
            });
        });
    };
    CustomHistory.prototype.navigateTo = function (url) {
        var _this = this;
        this.loadRouter(url).then(function (status) { return status && _this.history.push(url); });
    };
    CustomHistory.prototype.redirect = function (url) {
        var _this = this;
        var isServer = typeof window === 'undefined';
        isServer ? this.history.replace(url) : this.loadRouter(url).then(function (status) { return status && _this.history.replace(url); });
    };
    CustomHistory.prototype.resolve = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var location, status, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        location = this.history.location;
                        return [4 /*yield*/, this.resolveIntercept(location)];
                    case 1:
                        status = _b.sent();
                        _a = status;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.listener()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        _a;
                        return [2 /*return*/];
                }
            });
        });
    };
    CustomHistory.prototype.destroy = function () {
        this.unListen();
        this.activeRoute.unsubscribe();
        this.pushRoute.unsubscribe();
        this.cancelRoute.unsubscribe();
    };
    Object.defineProperty(CustomHistory.prototype, "currentRouteInfo", {
        get: function () {
            return this._routeInfo || { path: null, params: {}, query: {}, list: [] };
        },
        enumerable: false,
        configurable: true
    });
    CustomHistory.prototype.listener = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var location, routeInfo, needResolve;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        location = this.history.location;
                        routeInfo = this.createRouteInfo(location);
                        needResolve = routeInfo.list.some(function (routeItem) { return routeItem.loadModule; });
                        if (!needResolve) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.resolve()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, (0, rxjs_1.lastValueFrom)(this.router.loadResolve(routeInfo))];
                    case 3:
                        _a.sent();
                        this.activeRoute.next(this._routeInfo = routeInfo);
                        return [2 /*return*/];
                }
            });
        });
    };
    CustomHistory.prototype.resolveIntercept = function (location) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var routeInfo, status;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        routeInfo = this.createRouteInfo(location);
                        return [4 /*yield*/, (0, rxjs_1.lastValueFrom)(this.router.canActivate(routeInfo))];
                    case 1:
                        status = _a.sent();
                        if (!!status) return [3 /*break*/, 2];
                        routeInfo.list = [];
                        this.cancelRoute.next(routeInfo);
                        return [3 /*break*/, 5];
                    case 2: return [4 /*yield*/, this.router.loadModule(routeInfo)];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.resolveIntercept(location)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [2 /*return*/, status];
                }
            });
        });
    };
    CustomHistory.prototype.createRouteInfo = function (location) {
        var _a = tslib_1.__read(this.parse(location), 2), pathname = _a[0], query = _a[1];
        var _b = this.router.getRouterByPath(pathname), params = _b.params, _c = _b.list, list = _c === void 0 ? [] : _c;
        return { path: pathname, query: query, params: params, list: list };
    };
    CustomHistory.prototype.parsePath = function (url) {
        return {
            pathname: (url.match(/([^?#]*)/ig) || ['/'])[0],
            search: (url.match(/\?([^#]*)/ig) || [''])[0],
            hash: (url.match(/#([^?]*)/ig) || [''])[0]
        };
    };
    CustomHistory.prototype.parse = function (location) {
        var pathname = location.pathname, _a = location.search, search = _a === void 0 ? '' : _a;
        return ["/".concat(pathname).replace('//', '/'), this.parseSearch(search.replace(/^\?/, ''))];
    };
    CustomHistory.prototype.parseSearch = function (search) {
        var query = {};
        (search.match(/[^&]+/ig) || []).forEach(function (item) {
            var _a = tslib_1.__read(item.split('='), 2), name = _a[0], value = _a[1];
            query[name] = value;
        });
        return query;
    };
    var _a;
    CustomHistory = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _a : Object])
    ], CustomHistory);
    return CustomHistory;
}());
exports.CustomHistory = CustomHistory;