"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationContext = exports.APPLICATION_METADATA = exports.APPLICATION_TOKEN = exports.PLATFORM_SCOPE = void 0;
var tslib_1 = require("tslib");
// eslint-disable-next-line max-len
var di_1 = require("@fm/di");
var lodash_1 = require("lodash");
var utility_1 = require("../../utility");
var APPLICATION = 'Application';
var DELETE_TOKEN = di_1.InjectorToken.get('DELETE_TOKEN');
exports.PLATFORM_SCOPE = 'platform';
exports.APPLICATION_TOKEN = di_1.InjectorToken.get('APPLICATION_TOKEN');
exports.APPLICATION_METADATA = di_1.InjectorToken.get('APPLICATION_METADATA');
var ApplicationContext = /** @class */ (function () {
    function ApplicationContext(_platformProviders, _providers) {
        if (_platformProviders === void 0) { _platformProviders = []; }
        if (_providers === void 0) { _providers = []; }
        this._platformProviders = _platformProviders;
        this._providers = _providers;
        this.dynamicInjectors = [];
        this.addDefaultProvider(_providers, di_1.ROOT_SCOPE);
        this.addDefaultProvider([_platformProviders, { provide: ApplicationContext, useValue: this }], exports.PLATFORM_SCOPE);
    }
    ApplicationContext.prototype.addDefaultProvider = function (providers, scope) {
        var _this = this;
        var initFactory = function (injector) { return (_this.addInjector(injector), scope); };
        var deleteFactory = function (injector) { return ({ destroy: function () { return _this.deleteInjector(injector); } }); };
        providers.unshift([
            { provide: DELETE_TOKEN, useFactory: deleteFactory, deps: [di_1.Injector] },
            { provide: di_1.INJECTOR_SCOPE, useFactory: initFactory, deps: [di_1.Injector, DELETE_TOKEN] }
        ]);
    };
    ApplicationContext.prototype.addInjector = function (injector) {
        this.dynamicInjectors.push(injector);
    };
    ApplicationContext.prototype.deleteInjector = function (injector) {
        var indexOf = this.dynamicInjectors.findIndex(function (item) { return item === injector; });
        if (indexOf !== -1)
            this.dynamicInjectors.splice(indexOf, 1);
    };
    ApplicationContext.prototype.setDynamicProvider = function (provider, isPlatform) {
        if (isPlatform === void 0) { isPlatform = false; }
        var provide = provider.provide;
        this.dynamicInjectors.forEach(function (injector) {
            var needPush = isPlatform ? injector.scope === exports.PLATFORM_SCOPE : injector.scope !== exports.PLATFORM_SCOPE;
            if (needPush)
                injector.set(provide, provider);
        });
    };
    ApplicationContext.prototype.addProvider = function (provider) {
        this._providers.push(provider);
        this.setDynamicProvider(provider);
    };
    ApplicationContext.prototype.addPlatformProvider = function (provider) {
        this._platformProviders.push(provider);
        this.setDynamicProvider(provider, true);
    };
    ApplicationContext.prototype.getApp = function (injector, app, metadata) {
        var _a;
        if (metadata === void 0) { metadata = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var isProvide, _metadata, _b, factor;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        isProvide = typeof metadata === 'function' || metadata instanceof di_1.InjectorToken;
                        if (!isProvide) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve(((_a = injector.get(metadata)) === null || _a === void 0 ? void 0 : _a.load()) || {})];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = metadata;
                        _c.label = 3;
                    case 3:
                        _metadata = _b;
                        factor = function () { return (0, utility_1.cloneDeepPlain)(_metadata); };
                        this.addProvider({ provide: exports.APPLICATION_METADATA, useFactory: factor });
                        return [2 /*return*/, injector.get(app)];
                }
            });
        });
    };
    ApplicationContext.prototype.registerApp = function (app, metadata) {
        var _this = this;
        if (metadata === void 0) { metadata = {}; }
        var appFactory = function (injector) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, this.getApp(injector, app, metadata)];
        }); }); };
        this.addProvider({ provide: exports.APPLICATION_TOKEN, useFactory: appFactory, deps: [di_1.Injector] });
        (0, di_1.Injectable)()(app);
        this.runStart();
    };
    ApplicationContext.prototype.registerStart = function (runStart) {
        this.runStart = runStart;
    };
    ApplicationContext.prototype.makeApplicationDecorator = function () {
        var _this = this;
        return (0, di_1.makeDecorator)(APPLICATION, undefined, function (injectableType, metadata) { return _this.registerApp(injectableType, metadata); });
    };
    ApplicationContext.prototype.makeProvDecorator = function (name) {
        var _this = this;
        var typeFn = function (type, method, descriptor) {
            var meta = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                meta[_i - 3] = arguments[_i];
            }
            var _a = meta[0], token = _a === void 0 ? method : _a, _b = meta[1], options = _b === void 0 ? {} : _b;
            var providedIn = options.providedIn, others = tslib_1.__rest(options, ["providedIn"]);
            var useFactory = function (target) { return descriptor.value.apply(target); };
            var providers = providedIn === exports.PLATFORM_SCOPE ? _this.addPlatformProvider : _this.addProvider;
            providers.call(_this, tslib_1.__assign(tslib_1.__assign({ provide: token }, others), { useFactory: useFactory, deps: [type] }));
        };
        return (0, di_1.makeMethodDecorator)(name, undefined, typeFn);
    };
    ApplicationContext.prototype.makePropInput = function (name) {
        var _this = this;
        var typeFn = function (target, prop, key) {
            var useFactory = function (metadata) { return (0, lodash_1.get)(metadata, key); };
            _this.addProvider({ provide: target.__prop__metadata__[prop][0], useFactory: useFactory, deps: [exports.APPLICATION_METADATA] });
        };
        return (0, di_1.makePropDecorator)(name, function (key) { return ({ key: key }); }, typeFn);
    };
    Object.defineProperty(ApplicationContext.prototype, "platformProviders", {
        get: function () {
            return this._platformProviders;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApplicationContext.prototype, "providers", {
        get: function () {
            return this._providers;
        },
        enumerable: false,
        configurable: true
    });
    return ApplicationContext;
}());
exports.ApplicationContext = ApplicationContext;