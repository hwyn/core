import { Provider } from '@hwy-fm/di';
import type { BootstrapOptions } from './decorator';
export { PLATFORM_SCOPE } from './decorator';
export { ApplicationContext } from './application';
export declare function createPlatformFactory<T>(createPlatform: ((options: BootstrapOptions, providers: Provider[]) => T) | null, ...providers: Provider[]): (options: BootstrapOptions, ...extraProviders: Provider[]) => T;
