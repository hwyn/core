import { Context } from '../../types';
import { PipelineNode } from './node';
export interface ExecutionPlan {
    readonly pipeline: PipelineNode[];
    readonly runner: PipelineRunner;
}
export type PipelineRunner = (context: Context, next?: () => Promise<any>) => Promise<any>;
