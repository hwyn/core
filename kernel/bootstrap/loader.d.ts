import { Injector } from '@hwy-fm/di';
import { KernelCompiler } from '../compiler';
import { Registry } from '../registry/registry';
import { AggregateRouterStrategy } from '../routing/aggregate';
import { SeedInstruction } from '../types';
export declare class KernelLoader {
    private compiler;
    private injector;
    private registry;
    private router;
    private compiledSeeds;
    constructor(compiler: KernelCompiler, injector: Injector, registry: Registry, router: AggregateRouterStrategy);
    bootstrap(): Promise<void>;
    mount(seeds?: SeedInstruction[]): Promise<void>;
    private sortByPath;
}
