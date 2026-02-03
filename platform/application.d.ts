import { Injector, Type } from '@hwy-fm/di';
export declare class ApplicationContext {
    resolveMetadata(injector: Injector, metadata: any): Promise<any>;
    getApp(injector: Injector, app: Type): Promise<any>;
}
