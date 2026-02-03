import { AggregateRouterStrategy } from '../routing/aggregate';
import { PipelineExecutor } from '../types';
import { PipelineNode } from './ast/node';
export declare class PipelineComposer {
    private router;
    constructor(router: AggregateRouterStrategy);
    compose(nodes: PipelineNode[]): PipelineExecutor;
    private createProductionRunner;
    private createDebugRunner;
    private runDebugNode;
    private trace;
}
