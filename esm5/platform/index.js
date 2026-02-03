import { Injector } from '@hwy-fm/di';
import { PLATFORM } from "../token/index.js";
export { PLATFORM_SCOPE } from "./decorator.js";
export { ApplicationContext } from "./application.js";
export function createPlatformFactory(createPlatform) {
    var providers = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        providers[_i - 1] = arguments[_i];
    }
    return function (options) {
        var extraProviders = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extraProviders[_i - 1] = arguments[_i];
        }
        var injectorProviders = providers.concat(extraProviders);
        if (!createPlatform) {
            injectorProviders.push(options.platformProviders);
            return Injector.create(injectorProviders).get(PLATFORM);
        }
        return createPlatform(options, injectorProviders);
    };
}