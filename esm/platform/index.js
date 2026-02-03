import { Injector } from '@hwy-fm/di';
import { PLATFORM } from "../token/index.js";
export { PLATFORM_SCOPE } from "./decorator.js";
export { ApplicationContext } from "./application.js";
export function createPlatformFactory(createPlatform, ...providers) {
    return (options, ...extraProviders) => {
        const injectorProviders = providers.concat(extraProviders);
        if (!createPlatform) {
            injectorProviders.push(options.platformProviders);
            return Injector.create(injectorProviders).get(PLATFORM);
        }
        return createPlatform(options, injectorProviders);
    };
}