import { PatternInstruction, PipelineInstruction, SeedInstruction } from '../types';
import { SlotDefinition } from '../types';
export type InstructionBatch = (PipelineInstruction | SeedInstruction | PatternInstruction)[];
export interface SlotRegistration {
    definition: SlotDefinition;
    resolverToken: any;
}
