import { PipelineExecutor, PipelineInstruction } from '../../types';
export interface CompiledPipeline {
    nodes: PipelineNode[];
    runner: PipelineExecutor;
}
export interface PipelineNode {
    readonly executor: PipelineExecutor;
    readonly id: string;
    readonly instruction: PipelineInstruction;
}
