import { Context } from './context';
import { PipelineInstruction, ProtocolIdentifier } from './instruction';
export interface ISlotResolver {
    resolve(instruction: PipelineInstruction): PipelineExecutor | Promise<PipelineExecutor>;
}
export type PipelineExecutor = (context: Context, next?: () => Promise<any>) => any | Promise<any>;
export interface SlotDefinition {
    anchors?: {
        after?: string[];
        before?: string[];
    };
    name: string;
    stage: SlotStageDef;
    /**
     * The Protocol ID to which this Slot belongs.
     * This provides strict Namespace Isolation.
     *
     * - If a Slot is bound to `HTTP_PROTOCOL`, it is invisible to `JOB_PROTOCOL` Seeds.
     * - Different protocols can reuse the same Slot Name (e.g. 'SETUP', 'AUTH').
     */
    protocol: ProtocolIdentifier;
    /**
     * The profiles that this slot belongs to.
     * Default: ['default'] if not specified during registration.
     *
     * Supports wildcard matching:
     * - `*`: Matches any profile (Global).
     * - `job-*`: Matches any profile starting with "job-" (e.g. "job-nightly").
     * - Special characters (like `.`) are treated as literals (e.g. "v1.0" matches only "v1.0").
     */
    profiles: string[];
}
export type SlotStageDef = 'INGRESS' | 'PROCESS' | 'EGRESS';
