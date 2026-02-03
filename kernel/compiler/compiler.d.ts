import { Injector } from '@hwy-fm/di';
import { Registry } from '../registry/registry';
import { SeedInstruction } from '../types';
import { ExecutionPlan } from './ast/plan';
import { PipelineCompiler } from './pipeline.compiler';
export declare class KernelCompiler {
    private readonly pipelineCompiler;
    private readonly registry;
    constructor(pipelineCompiler: PipelineCompiler, registry: Registry);
    compile(hostClass: any, propertyKey: string, injector: Injector): Promise<ExecutionPlan>;
    buildPlan(seed: SeedInstruction, injector: Injector): Promise<ExecutionPlan>;
    compileAll(injector: Injector): Promise<ExecutionPlan[]>;
    compilePartial(instructions: any[], injector: Injector): Promise<any[]>;
}
