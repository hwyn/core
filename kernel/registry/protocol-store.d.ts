import { PatternInstruction, PipelineInstruction, SeedInstruction, SlotDefinition } from '../types';
import { SlotRegistration } from './types';
/**
 * Internal storage for a single Protocol.
 * This ensures strict physical isolation of metadata between protocols.
 */
export declare class ProtocolStore {
    readonly seeds: {
        process: SeedInstruction[];
        ingress: SeedInstruction[];
    };
    readonly instructions: {
        all: PipelineInstruction[];
        bySlot: Map<string, PipelineInstruction[]>;
        floating: PatternInstruction[];
    };
    readonly slots: Map<string, SlotDefinition>;
    readonly wildcardSlots: {
        slot: SlotDefinition;
        matchers: RegExp[];
    }[];
    readonly resolverTokens: Map<string, any>;
    readonly scopeTree: Map<any, {
        cls: PipelineInstruction[];
        methods: Map<string | symbol, PipelineInstruction[]>;
    }>;
    indexInstruction(inst: PipelineInstruction): void;
    registerSlot(reg: SlotRegistration): void;
    registerSeed(s: SeedInstruction): void;
    private isPattern;
    private compilePattern;
}
