import { __awaiter, __rest } from "tslib";
/* eslint-disable max-len */
import { DecoratorFlags, Injector, INJECTOR_ENV, INJECTOR_SCOPE, InstantiationPolicy, makeDecorator, makeMethodDecorator, markInject, register, ROOT_SCOPE, setInjectableDef } from '@hwy-fm/di';
import { APPLICATION_METADATA, APPLICATION_PLUGIN, APPLICATION_TOKEN } from "../token/index.js";
import { ApplicationContext } from "./application.js";
import { makeParamDecorator } from '@hwy-fm/di';
import { MetadataTransform } from "./metadata.transform.js";
export const PLATFORM_SCOPE = 'platform';
export const createRegisterLoader = function (token) {
    let list;
    return (loader) => {
        if (!list)
            register({ provide: token, useValue: list = [] });
        list.push(loader);
    };
};
export const Register = makeDecorator('Register', register);
export const Order = makeDecorator('Order', (order = 0) => ({ order }), (type, { metadata }) => {
    Object.defineProperty(type, '__order__', { value: metadata.order });
});
export const ApplicationPlugin = makeDecorator('ApplicationPlugin', undefined, (plugin) => {
    register({ provide: APPLICATION_PLUGIN, multi: true, useExisting: setInjectableDef(plugin) });
});
export const Prov = makeMethodDecorator('ProvDecorator', undefined, (type, method, descriptor, { args: meta }) => {
    const [token = method, _a] = meta, _b = _a === void 0 ? {} : _a, { deps = [], scope } = _b, options = __rest(_b, ["deps", "scope"]);
    const useFactory = (target, ...args) => descriptor.value.apply(target, args);
    register(Object.assign(Object.assign({ provide: token }, options), { useFactory, deps: [type, ...deps] }), scope);
});
export const runtimeInjector = (toke) => () => {
    const injector = Injector.__prov_def__.factory();
    if (!injector)
        throw new Error('RuntimeInjector: No injection context active.');
    return injector.get(toke);
};
const InputParam = makeParamDecorator('InputParamDecorator', (key) => ({ key, token: MetadataTransform }));
export const Input = markInject(InputParam, DecoratorFlags.Pipeline);
export const makeApplication = (handler) => {
    function typeFn(type, { args: [metadata] }) {
        const activeEnv = InstantiationPolicy.activeEnv;
        const metadataFactory = (injector, ctx) => __awaiter(this, void 0, void 0, function* () { return ctx.resolveMetadata(injector, metadata); });
        const appFactory = (injector, ctx) => __awaiter(this, void 0, void 0, function* () { return ctx.getApp(injector, type); });
        const platformProviders = [
            { provide: INJECTOR_ENV, useValue: activeEnv },
            { provide: INJECTOR_SCOPE, useValue: PLATFORM_SCOPE },
        ];
        const providers = [
            ApplicationContext,
            { provide: INJECTOR_ENV, useValue: activeEnv },
            { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE },
            { provide: APPLICATION_METADATA, useFactory: metadataFactory, deps: [Injector, ApplicationContext] },
            { provide: APPLICATION_TOKEN, useFactory: appFactory, deps: [Injector, ApplicationContext, APPLICATION_METADATA] }
        ];
        const options = {
            get providers() { return providers; },
            get platformProviders() { return platformProviders; }
        };
        setInjectableDef(type);
        handler(options);
    }
    return makeDecorator('Application', undefined, typeFn);
};