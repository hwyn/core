import { PatternInstruction, PipelineInstruction, ProtocolIdentifier, SeedInstruction, SlotDefinition } from '../types';
import { InstructionBatch, SlotRegistration } from './types';
export declare class Registry {
    private readonly stores;
    private getStore;
    registerInstructions(batch: InstructionBatch): void;
    registerSeeds(seeds: SeedInstruction[]): void;
    registerSlot(reg: SlotRegistration): void;
    getInstructionsBySlot(slotName: string, protocol: ProtocolIdentifier): PipelineInstruction[];
    getIngressSeeds(protocol?: ProtocolIdentifier): SeedInstruction[];
    getProcessSeeds(protocol?: ProtocolIdentifier): SeedInstruction[];
    getFloatingPatterns(protocol: ProtocolIdentifier): PatternInstruction[];
    getClassInstructions(target: any, protocol: ProtocolIdentifier): PipelineInstruction[];
    getMethodInstructions(target: any, propertyKey: string | symbol, protocol?: ProtocolIdentifier): PipelineInstruction[];
    getSeeds(protocol?: ProtocolIdentifier): SeedInstruction[];
    getSlotsByProfile(profile: string, protocol: ProtocolIdentifier): SlotDefinition[];
    getSlotDefinition(name: string, protocol: ProtocolIdentifier): SlotDefinition | undefined;
    getAllSlots(protocol: ProtocolIdentifier): SlotDefinition[];
    getResolverToken(token: string, protocol: ProtocolIdentifier): any | undefined;
}
