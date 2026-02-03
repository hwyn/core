import { __awaiter } from "tslib";
import { cloneDeepWith, isPlainObject } from 'lodash';
import { forkJoin, from, isObservable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { addRouterKey, serializeRouter } from "./serialize-router.js";
const getRex = () => /^:([^:]+)/g;
function type(obj) {
    return Object.prototype.toString.call(obj).replace(/\[object (.*)\]/, '$1');
}
export class Router {
    constructor(injector, routerConfig) {
        this.injector = injector;
        this.routerConfig = routerConfig;
        this.routerList = [];
        this.refreshRouterList();
    }
    getRouterByPath(pathname) {
        let params = {};
        const pathList = pathname.split('/');
        const router = this.routerList.find(({ path }) => {
            params = {};
            return !((path === null || path === void 0 ? void 0 : path.split('/')) || []).some((itemPath, index) => {
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
        const routeInfo = cloneDeepWith(Object.assign(Object.assign({}, router), { params }), (obj) => type(obj) === 'Object' && !isPlainObject(obj) ? obj : undefined);
        return this.pathKey(pathname, routeInfo);
    }
    loadModule(routeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { list = [] } = routeInfo;
            const promiseAll = [];
            list.forEach((routeItem) => {
                const { loadModule } = routeItem;
                if (loadModule) {
                    promiseAll.push(loadModule().then((result) => {
                        Object.assign(routeInfo, { needRefresh: this.addRouteConfig(routeItem, result) });
                    }));
                }
            });
            return yield Promise.all(promiseAll).then(() => !!routeInfo.needRefresh);
        });
    }
    canActivate(routeInfo) {
        const execList = this.getExecList(routeInfo, (routeItem) => {
            const { canActivate = [] } = routeItem;
            return canActivate.map((item) => [routeItem, item]);
        });
        return execList.reduce((ob, [routeItem, activate]) => ob.pipe(mergeMap((result) => {
            const service = this.injector.get(activate);
            if (result !== false && service) {
                const activeResult = service.canActivate(routeInfo, routeItem);
                return this.toObservable(activeResult);
            }
            return of(result);
        })), of(true));
    }
    loadResolve(routeInfo) {
        const execList = this.getExecList(routeInfo, (routeItem) => {
            const { resolve = {} } = routeItem;
            return Object.keys(resolve).map((key) => [routeItem, [key, resolve[key]]]);
        });
        const list = [];
        execList.forEach(([routeItem, [key, result]]) => {
            const { props = {} } = routeItem;
            const server = this.injector.get(result);
            routeItem.props = props;
            if (server && server.resolve) {
                result = server.resolve(routeInfo, routeItem);
                if (result && (result.then || isObservable(result))) {
                    return list.push(this.toObservable(result).pipe(tap((r) => props[key] = r)));
                }
            }
            props[key] = result;
        });
        return list.length ? forkJoin(list) : of([]);
    }
    pathKey(pathname, routeInfo) {
        const { params, list = [] } = routeInfo;
        list.forEach((routeItem) => {
            const { path } = routeItem;
            const hasRex = path.indexOf('*') !== -1;
            routeItem.key = hasRex ? pathname : path.replace(getRex(), (a, b) => params[b]);
        });
        return routeInfo;
    }
    getExecList(routeInfo, handler) {
        const { list = [] } = routeInfo;
        return [...list].reverse().reduce((arr, routeItem) => arr.concat(handler(routeItem)), []);
    }
    addRouteConfig(routeItem, result) {
        const { children = [] } = result;
        const routeConfig = this.getRouteItemByPath(this.routerConfig, routeItem.flag);
        delete routeItem.loadModule;
        delete routeConfig.loadModule;
        Object.assign(routeConfig, result);
        this.refreshRouterList();
        return children.length;
    }
    getRouteItemByPath(routerConfig, flag) {
        let item;
        for (let i = 0; i < routerConfig.length; i++) {
            item = routerConfig[i];
            if (item.flag === flag || (item = this.getRouteItemByPath(item.children || [], flag))) {
                return item;
            }
        }
    }
    refreshRouterList() {
        const routerConfig = this.routerConfig;
        this.routerConfig = Array.isArray(routerConfig) ? routerConfig : [routerConfig];
        addRouterKey(this.routerConfig);
        this.routerList = serializeRouter(this.routerConfig);
    }
    toObservable(result) {
        if (isObservable(result)) {
            return result;
        }
        return result.then ? from(result) : of(result);
    }
}