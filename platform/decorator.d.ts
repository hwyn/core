import { Provider, TokenKey, Type } from '@hwy-fm/di';
type MetadataProps = {
    [key: string]: any;
};
type ProvDecorator = (token: TokenKey, provider?: Provider | {
    scope?: string;
    [key: string]: any;
}) => MethodDecorator;
export declare const PLATFORM_SCOPE = "platform";
export interface PluginIntercept {
    register(): Promise<void>;
    destroy?(): Promise<void>;
}
export interface MetadataInfo {
    load(): Promise<MetadataProps> | MetadataProps;
}
export interface BootstrapOptions {
    providers: Provider[];
    platformProviders: Provider[];
}
export declare const createRegisterLoader: <T>(token: TokenKey) => (loader: T) => void;
export declare const Register: (input: Provider | Provider[], scope?: string, isDecorator?: boolean) => import("di/metadata").ClassDecorator<any>;
export declare const Order: (order?: number) => import("di/metadata").ClassDecorator<any>;
export declare const ApplicationPlugin: () => import("di/metadata").ClassDecorator<PluginIntercept>;
export declare const Prov: ProvDecorator;
export declare const runtimeInjector: <T>(toke: Type<T> | TokenKey) => () => T;
export declare const Input: (key: string) => import("di/metadata").TargetDecorator;
export declare const makeApplication: <T = Type<MetadataInfo> | MetadataProps>(handler: (options: BootstrapOptions) => void) => (metadata?: T) => import("di/metadata").ClassDecorator<any>;
export {};
