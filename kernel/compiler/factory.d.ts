import { Injector } from '@hwy-fm/di';
import { Registry } from '../registry/registry';
import { PipelineInstruction, SeedInstruction } from '../types';
import { PipelineNode } from './ast/node';
export declare class NodeFactory {
    private readonly registry;
    constructor(registry: Registry);
    create(instruction: PipelineInstruction, injector: Injector, context?: {
        seed?: SeedInstruction;
    }): Promise<PipelineNode>;
}
