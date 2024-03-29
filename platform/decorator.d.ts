import { Provider, TokenKey, Type } from '@fm/di';
import type { ApplicationContext } from './application';
type ProvDecorator = (token: TokenKey, provider?: {
    providedIn?: string;
    [key: string]: any;
}) => any;
interface PluginIntercept {
    register(): Promise<void>;
}
export declare const registerProvider: (provider: Provider) => number;
export declare const ApplicationPlugin: <T extends PluginIntercept>(this: unknown, ...args: any[]) => (cls: Type<T>) => any;
export declare const Prov: ProvDecorator;
export declare const Input: (key: string) => any;
export declare const execute: (applicationContext: ApplicationContext) => void;
export {};
