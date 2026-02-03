import { KernelCompiler } from '../compiler/compiler';
import { Context } from '../types';
export declare class RuntimePipelineUtils {
    private compiler;
    constructor(compiler: KernelCompiler);
    getPlan(context: Context): ReadonlyArray<{
        executor: Function;
    }>;
    inject(context: Context, instructions: any[]): Promise<void>;
}
