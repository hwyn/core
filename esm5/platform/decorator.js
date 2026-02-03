import { __assign, __awaiter, __generator, __read, __rest, __spreadArray } from "tslib";
/* eslint-disable max-len */
import { DecoratorFlags, Injector, INJECTOR_ENV, INJECTOR_SCOPE, InstantiationPolicy, makeDecorator, makeMethodDecorator, markInject, register, ROOT_SCOPE, setInjectableDef } from '@hwy-fm/di';
import { APPLICATION_METADATA, APPLICATION_PLUGIN, APPLICATION_TOKEN } from "../token/index.js";
import { ApplicationContext } from "./application.js";
import { makeParamDecorator } from '@hwy-fm/di';
import { MetadataTransform } from "./metadata.transform.js";
export var PLATFORM_SCOPE = 'platform';
export var createRegisterLoader = function (token) {
    var list;
    return function (loader) {
        if (!list)
            register({ provide: token, useValue: list = [] });
        list.push(loader);
    };
};
export var Register = makeDecorator('Register', register);
export var Order = makeDecorator('Order', function (order) {
    if (order === void 0) { order = 0; }
    return ({ order: order });
}, function (type, _a) {
    var metadata = _a.metadata;
    Object.defineProperty(type, '__order__', { value: metadata.order });
});
export var ApplicationPlugin = makeDecorator('ApplicationPlugin', undefined, function (plugin) {
    register({ provide: APPLICATION_PLUGIN, multi: true, useExisting: setInjectableDef(plugin) });
});
export var Prov = makeMethodDecorator('ProvDecorator', undefined, function (type, method, descriptor, _a) {
    var meta = _a.args;
    var _b = __read(meta, 2), _c = _b[0], token = _c === void 0 ? method : _c, _d = _b[1], _e = _d === void 0 ? {} : _d, _f = _e.deps, deps = _f === void 0 ? [] : _f, scope = _e.scope, options = __rest(_e, ["deps", "scope"]);
    var useFactory = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return descriptor.value.apply(target, args);
    };
    register(__assign(__assign({ provide: token }, options), { useFactory: useFactory, deps: __spreadArray([type], __read(deps), false) }), scope);
});
export var runtimeInjector = function (toke) { return function () {
    var injector = Injector.__prov_def__.factory();
    if (!injector)
        throw new Error('RuntimeInjector: No injection context active.');
    return injector.get(toke);
}; };
var InputParam = makeParamDecorator('InputParamDecorator', function (key) { return ({ key: key, token: MetadataTransform }); });
export var Input = markInject(InputParam, DecoratorFlags.Pipeline);
export var makeApplication = function (handler) {
    function typeFn(type, _a) {
        var _this = this;
        var _b = __read(_a.args, 1), metadata = _b[0];
        var activeEnv = InstantiationPolicy.activeEnv;
        var metadataFactory = function (injector, ctx) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ctx.resolveMetadata(injector, metadata)];
        }); }); };
        var appFactory = function (injector, ctx) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ctx.getApp(injector, type)];
        }); }); };
        var platformProviders = [
            { provide: INJECTOR_ENV, useValue: activeEnv },
            { provide: INJECTOR_SCOPE, useValue: PLATFORM_SCOPE },
        ];
        var providers = [
            ApplicationContext,
            { provide: INJECTOR_ENV, useValue: activeEnv },
            { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE },
            { provide: APPLICATION_METADATA, useFactory: metadataFactory, deps: [Injector, ApplicationContext] },
            { provide: APPLICATION_TOKEN, useFactory: appFactory, deps: [Injector, ApplicationContext, APPLICATION_METADATA] }
        ];
        var options = {
            get providers() { return providers; },
            get platformProviders() { return platformProviders; }
        };
        setInjectableDef(type);
        handler(options);
    }
    return makeDecorator('Application', undefined, typeFn);
};