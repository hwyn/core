import { PipelineInstruction, ProtocolIdentifier } from '../types';
import { Registry } from '../registry/registry';
export declare class PipelineSorter {
    private readonly registry;
    private readonly STAGES;
    private readonly STAGE_WEIGHT;
    private readonly cachedSequence;
    constructor(registry: Registry);
    groupAndSort(instructions: PipelineInstruction[], protocol: ProtocolIdentifier): SortedGroups;
    sort(instructions: PipelineInstruction[], protocol: ProtocolIdentifier): PipelineInstruction[];
    private computeSlotSequence;
    private sortSlotsInStage;
    private performTopologicalSort;
    private processDependency;
    private addEdge;
    private throwTopologyError;
}
export interface SortedGroups {
    ingress: PipelineInstruction[];
    process: PipelineInstruction[];
    egress: PipelineInstruction[];
}
