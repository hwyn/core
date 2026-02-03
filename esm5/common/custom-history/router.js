import { __assign, __awaiter, __generator, __read, __spreadArray } from "tslib";
import { cloneDeepWith, isPlainObject } from 'lodash';
import { forkJoin, from, isObservable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { addRouterKey, serializeRouter } from "./serialize-router.js";
var getRex = function () { return /^:([^:]+)/g; };
function type(obj) {
    return Object.prototype.toString.call(obj).replace(/\[object (.*)\]/, '$1');
}
var Router = /** @class */ (function () {
    function Router(injector, routerConfig) {
        this.injector = injector;
        this.routerConfig = routerConfig;
        this.routerList = [];
        this.refreshRouterList();
    }
    Router.prototype.getRouterByPath = function (pathname) {
        var params = {};
        var pathList = pathname.split('/');
        var router = this.routerList.find(function (_a) {
            var path = _a.path;
            params = {};
            return !((path === null || path === void 0 ? void 0 : path.split('/')) || []).some(function (itemPath, index) {
                if (itemPath === '*' || itemPath === pathList[index]) {
                    return false;
                }
                if (getRex().test(itemPath) && pathList.length > index) {
                    params[itemPath.replace(getRex(), '$1')] = pathList[index];
                    return false;
                }
                return true;
            });
        });
        var routeInfo = cloneDeepWith(__assign(__assign({}, router), { params: params }), function (obj) { return type(obj) === 'Object' && !isPlainObject(obj) ? obj : undefined; });
        return this.pathKey(pathname, routeInfo);
    };
    Router.prototype.loadModule = function (routeInfo) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, list, promiseAll;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = routeInfo.list, list = _a === void 0 ? [] : _a;
                        promiseAll = [];
                        list.forEach(function (routeItem) {
                            var loadModule = routeItem.loadModule;
                            if (loadModule) {
                                promiseAll.push(loadModule().then(function (result) {
                                    Object.assign(routeInfo, { needRefresh: _this.addRouteConfig(routeItem, result) });
                                }));
                            }
                        });
                        return [4 /*yield*/, Promise.all(promiseAll).then(function () { return !!routeInfo.needRefresh; })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Router.prototype.canActivate = function (routeInfo) {
        var _this = this;
        var execList = this.getExecList(routeInfo, function (routeItem) {
            var _a = routeItem.canActivate, canActivate = _a === void 0 ? [] : _a;
            return canActivate.map(function (item) { return [routeItem, item]; });
        });
        return execList.reduce(function (ob, _a) {
            var _b = __read(_a, 2), routeItem = _b[0], activate = _b[1];
            return ob.pipe(mergeMap(function (result) {
                var service = _this.injector.get(activate);
                if (result !== false && service) {
                    var activeResult = service.canActivate(routeInfo, routeItem);
                    return _this.toObservable(activeResult);
                }
                return of(result);
            }));
        }, of(true));
    };
    Router.prototype.loadResolve = function (routeInfo) {
        var _this = this;
        var execList = this.getExecList(routeInfo, function (routeItem) {
            var _a = routeItem.resolve, resolve = _a === void 0 ? {} : _a;
            return Object.keys(resolve).map(function (key) { return [routeItem, [key, resolve[key]]]; });
        });
        var list = [];
        execList.forEach(function (_a) {
            var _b = __read(_a, 2), routeItem = _b[0], _c = __read(_b[1], 2), key = _c[0], result = _c[1];
            var _d = routeItem.props, props = _d === void 0 ? {} : _d;
            var server = _this.injector.get(result);
            routeItem.props = props;
            if (server && server.resolve) {
                result = server.resolve(routeInfo, routeItem);
                if (result && (result.then || isObservable(result))) {
                    return list.push(_this.toObservable(result).pipe(tap(function (r) { return props[key] = r; })));
                }
            }
            props[key] = result;
        });
        return list.length ? forkJoin(list) : of([]);
    };
    Router.prototype.pathKey = function (pathname, routeInfo) {
        var params = routeInfo.params, _a = routeInfo.list, list = _a === void 0 ? [] : _a;
        list.forEach(function (routeItem) {
            var path = routeItem.path;
            var hasRex = path.indexOf('*') !== -1;
            routeItem.key = hasRex ? pathname : path.replace(getRex(), function (a, b) { return params[b]; });
        });
        return routeInfo;
    };
    Router.prototype.getExecList = function (routeInfo, handler) {
        var _a = routeInfo.list, list = _a === void 0 ? [] : _a;
        return __spreadArray([], __read(list), false).reverse().reduce(function (arr, routeItem) { return arr.concat(handler(routeItem)); }, []);
    };
    Router.prototype.addRouteConfig = function (routeItem, result) {
        var _a = result.children, children = _a === void 0 ? [] : _a;
        var routeConfig = this.getRouteItemByPath(this.routerConfig, routeItem.flag);
        delete routeItem.loadModule;
        delete routeConfig.loadModule;
        Object.assign(routeConfig, result);
        this.refreshRouterList();
        return children.length;
    };
    Router.prototype.getRouteItemByPath = function (routerConfig, flag) {
        var item;
        for (var i = 0; i < routerConfig.length; i++) {
            item = routerConfig[i];
            if (item.flag === flag || (item = this.getRouteItemByPath(item.children || [], flag))) {
                return item;
            }
        }
    };
    Router.prototype.refreshRouterList = function () {
        var routerConfig = this.routerConfig;
        this.routerConfig = Array.isArray(routerConfig) ? routerConfig : [routerConfig];
        addRouterKey(this.routerConfig);
        this.routerList = serializeRouter(this.routerConfig);
    };
    Router.prototype.toObservable = function (result) {
        if (isObservable(result)) {
            return result;
        }
        return result.then ? from(result) : of(result);
    };
    return Router;
}());
export { Router };