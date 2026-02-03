import { InjectorToken } from '@hwy-fm/di';
import { StrategyToken } from '../routing/strategy';
export type ProtocolIdentifier = symbol | object | InjectorToken;
export declare enum InstructionAction {
    ADD = "ADD",
    EXCLUDE = "EXCLUDE",
    RESET = "RESET"
}
export interface PipelineInstruction {
    action?: InstructionAction;
    componentToken?: any;
    hostClass: any;
    order?: number;
    payload?: any;
    propertyKey?: string | symbol;
    slotName: string;
    route?: RouteDef;
    /**
     * Defines the strategy used to resolve routes.
     * If not provided, the default strategy (e.g., RadixRouterStrategy) will be used.
     */
    strategy?: StrategyToken;
    /**
     * The unique identity of the protocol/plugin this instruction supports.
     * used to prevent instruction pollution across different router plugins.
     */
    protocol: ProtocolIdentifier;
}
export interface InstructionDescriptor extends PipelineInstruction {
    action?: InstructionAction;
    enabled?: boolean;
}
export interface PatternInstruction extends PipelineInstruction {
    route?: RouteDef;
}
export interface PipelineDefinition {
    instructions: PipelineInstruction[];
    seed: SeedInstruction;
}
export declare enum Priority {
    HIGH = 20,
    LOW = 1,
    MEDIUM = 10
}
/**
 * Defines a routing rule for matching incoming Requests/Contexts.
 *
 * Supported patterns:
 * - **Exact Match**: `"/api/user"` matches exactly `"/api/user"`.
 * - **Hierarchy Wildcard**: `"/api/**"` matches `"/api/user"`, `"/api/user/details"`.
 * - **Segment Wildcard**: `"/api/*"` matches `"/api/user"` but NOT `"/api/user/details"`.
 * - **Parameters**: `"/api/:id"` matches `"/api/123"` (extracts params).
 * - **Regex**: `/^\/api\/v\d+$/` matches `"/api/v1"`, `"/api/v2"`.
 * - **Method & Path**: `{ method: 'POST', path: '/api/submit' }`.
 */
export type RouteDef = string | RegExp | {
    method?: string;
    path?: string | RegExp;
    [key: string]: any;
};
export interface SeedInstruction extends PipelineInstruction {
    aggregation: 'PROCESS_DEF' | 'INGRESS_ONLY';
    route?: RouteDef;
    profile?: string;
}
