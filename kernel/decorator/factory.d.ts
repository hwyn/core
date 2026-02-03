import { InstructionAction, InstructionDescriptor, RouteDef, ProtocolIdentifier } from '../types';
import { StrategyToken } from '../routing/strategy';
export declare const registerInstruction: (loader: InstructionDescriptor & {
    route?: RouteDef;
}) => void;
type InstructionPayload = Partial<{
    action: InstructionAction;
    route: RouteDef;
    componentToken: any;
    payload: any;
    protocol: ProtocolIdentifier;
    strategy: StrategyToken;
}>;
export interface DecoratorFactoryOptions {
    slot: string;
    action?: InstructionAction;
    protocol: ProtocolIdentifier;
    strategy?: StrategyToken;
}
export declare function createPipelineDecorator<T extends any[] = any[]>(options: DecoratorFactoryOptions, props?: (...args: T) => InstructionPayload): (...args: T) => ClassDecorator & MethodDecorator;
export {};
