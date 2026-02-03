import { __awaiter, __decorate, __generator, __metadata, __read } from "tslib";
import { Injectable, Injector } from '@hwy-fm/di';
import { lastValueFrom, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { HISTORY, ROUTER_CONFIG } from "../../token/index.js";
import { Router } from "./router.js";
var CustomHistory = /** @class */ (function () {
    function CustomHistory(injector) {
        this.injector = injector;
        this.activeRoute = new Subject().pipe(shareReplay(1));
        this.pushRoute = new Subject();
        this.cancelRoute = new Subject();
        this.history = this.injector.get(HISTORY);
        this.router = new Router(injector, this.injector.get(ROUTER_CONFIG));
        this.unListen = this.history.listen(this.listener.bind(this));
    }
    CustomHistory.prototype.loadRouter = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var location, status, _a;
            return __generator(this, function (_b) {
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
        return __awaiter(this, void 0, void 0, function () {
            var location, routeInfo, needResolve;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        location = this.history.location;
                        routeInfo = this.createRouteInfo(location);
                        needResolve = routeInfo.list.some(function (routeItem) { return routeItem.loadModule; });
                        if (!needResolve) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.resolve()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, lastValueFrom(this.router.loadResolve(routeInfo))];
                    case 3:
                        _a.sent();
                        this.activeRoute.next(this._routeInfo = routeInfo);
                        return [2 /*return*/];
                }
            });
        });
    };
    CustomHistory.prototype.resolveIntercept = function (location) {
        return __awaiter(this, void 0, Promise, function () {
            var routeInfo, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        routeInfo = this.createRouteInfo(location);
                        return [4 /*yield*/, lastValueFrom(this.router.canActivate(routeInfo))];
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
        var _a = __read(this.parse(location), 2), pathname = _a[0], query = _a[1];
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
            var _a = __read(item.split('='), 2), name = _a[0], value = _a[1];
            query[name] = value;
        });
        return query;
    };
    var _a;
    CustomHistory = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
    ], CustomHistory);
    return CustomHistory;
}());
export { CustomHistory };