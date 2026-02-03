"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApplication = exports.Input = exports.runtimeInjector = exports.Prov = exports.ApplicationPlugin = exports.Order = exports.Register = exports.createRegisterLoader = exports.PLATFORM_SCOPE = void 0;
var tslib_1 = require("tslib");
/* eslint-disable max-len */
var di_1 = require("@hwy-fm/di");
var token_1 = require("../token");
var application_1 = require("./application");
var di_2 = require("@hwy-fm/di");
var metadata_transform_1 = require("./metadata.transform");
exports.PLATFORM_SCOPE = 'platform';
var createRegisterLoader = function (token) {
    var list;
    return function (loader) {
        if (!list)
            (0, di_1.register)({ provide: token, useValue: list = [] });
        list.push(loader);
    };
};
exports.createRegisterLoader = createRegisterLoader;
exports.Register = (0, di_1.makeDecorator)('Register', di_1.register);
exports.Order = (0, di_1.makeDecorator)('Order', function (order) {
    if (order === void 0) { order = 0; }
    return ({ order: order });
}, function (type, _a) {
    var metadata = _a.metadata;
    Object.defineProperty(type, '__order__', { value: metadata.order });
});
exports.ApplicationPlugin = (0, di_1.makeDecorator)('ApplicationPlugin', undefined, function (plugin) {
    (0, di_1.register)({ provide: token_1.APPLICATION_PLUGIN, multi: true, useExisting: (0, di_1.setInjectableDef)(plugin) });
});
exports.Prov = (0, di_1.makeMethodDecorator)('ProvDecorator', undefined, function (type, method, descriptor, _a) {
    var meta = _a.args;
    var _b = tslib_1.__read(meta, 2), _c = _b[0], token = _c === void 0 ? method : _c, _d = _b[1], _e = _d === void 0 ? {} : _d, _f = _e.deps, deps = _f === void 0 ? [] : _f, scope = _e.scope, options = tslib_1.__rest(_e, ["deps", "scope"]);
    var useFactory = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return descriptor.value.apply(target, args);
    };
    (0, di_1.register)(tslib_1.__assign(tslib_1.__assign({ provide: token }, options), { useFactory: useFactory, deps: tslib_1.__spreadArray([type], tslib_1.__read(deps), false) }), scope);
});
var runtimeInjector = function (toke) { return function () {
    var injector = di_1.Injector.__prov_def__.factory();
    if (!injector)
        throw new Error('RuntimeInjector: No injection context active.');
    return injector.get(toke);
}; };
exports.runtimeInjector = runtimeInjector;
var InputParam = (0, di_2.makeParamDecorator)('InputParamDecorator', function (key) { return ({ key: key, token: metadata_transform_1.MetadataTransform }); });
exports.Input = (0, di_1.markInject)(InputParam, di_1.DecoratorFlags.Pipeline);
var makeApplication = function (handler) {
    function typeFn(type, _a) {
        var _this = this;
        var _b = tslib_1.__read(_a.args, 1), metadata = _b[0];
        var activeEnv = di_1.InstantiationPolicy.activeEnv;
        var metadataFactory = function (injector, ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, ctx.resolveMetadata(injector, metadata)];
        }); }); };
        var appFactory = function (injector, ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, ctx.getApp(injector, type)];
        }); }); };
        var platformProviders = [
            { provide: di_1.INJECTOR_ENV, useValue: activeEnv },
            { provide: di_1.INJECTOR_SCOPE, useValue: exports.PLATFORM_SCOPE },
        ];
        var providers = [
            application_1.ApplicationContext,
            { provide: di_1.INJECTOR_ENV, useValue: activeEnv },
            { provide: di_1.INJECTOR_SCOPE, useValue: di_1.ROOT_SCOPE },
            { provide: token_1.APPLICATION_METADATA, useFactory: metadataFactory, deps: [di_1.Injector, application_1.ApplicationContext] },
            { provide: token_1.APPLICATION_TOKEN, useFactory: appFactory, deps: [di_1.Injector, application_1.ApplicationContext, token_1.APPLICATION_METADATA] }
        ];
        var options = {
            get providers() { return providers; },
            get platformProviders() { return platformProviders; }
        };
        (0, di_1.setInjectableDef)(type);
        handler(options);
    }
    return (0, di_1.makeDecorator)('Application', undefined, typeFn);
};
exports.makeApplication = makeApplication;