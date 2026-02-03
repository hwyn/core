import { Injector } from '@hwy-fm/di';
import { InstructionAction, PipelineExecutor, PipelineInstruction, ProtocolIdentifier } from '../types';
export interface ISelfResolvingInstruction {
    resolve(injector: Injector): PipelineExecutor | Promise<PipelineExecutor>;
}
/**
 * Base class for creating lightweight, dynamic instructions that can be injected at runtime.
 *
 * It automatically fills in the required fields like `hostClass` (using a dummy placeholder)
 * and `action`, allowing developers to focus simply on the Slot and Payload.
 */
export declare class DynamicInstruction implements PipelineInstruction, ISelfResolvingInstruction {
    readonly slotName: string;
    readonly payload: any;
    readonly protocol: ProtocolIdentifier;
    readonly action: InstructionAction;
    readonly hostClass: any;
    readonly propertyKey: string | symbol;
    constructor(slotName: string, protocol: ProtocolIdentifier, payload?: any);
    resolve(injector: Injector): PipelineExecutor | Promise<PipelineExecutor>;
}
export declare class LambdaInstruction extends DynamicInstruction {
    private readonly runner;
    constructor(runner: PipelineExecutor, protocol: ProtocolIdentifier);
    resolve(): PipelineExecutor;
}
