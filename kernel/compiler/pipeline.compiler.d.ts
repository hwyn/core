import { Injector } from '@hwy-fm/di';
import { Registry } from '../registry/registry';
import { AggregateRouterStrategy } from '../routing/aggregate';
import { PipelineDefinition, PipelineInstruction, SeedInstruction } from '../types';
import { PipelineComposer } from './composer';
import { NodeFactory } from './factory';
import { PipelineSorter } from './sorter';
import { CompiledPipeline, PipelineNode } from './ast/node';
export declare class PipelineCompiler {
    private composer;
    private factory;
    private registry;
    private sorter;
    private router;
    constructor(composer: PipelineComposer, factory: NodeFactory, registry: Registry, sorter: PipelineSorter, router: AggregateRouterStrategy);
    build(seed: SeedInstruction, injector: Injector): Promise<CompiledPipeline>;
    compile(seed: SeedInstruction): PipelineDefinition;
    compileInstructions(instructions: PipelineInstruction[], injector: Injector): Promise<PipelineNode[]>;
    private collectRaw;
    private harvestSystemSlots;
    private harvestProcessScope;
    private resolveConflicts;
    private sortResolved;
    private isMatch;
    private materialize;
}
