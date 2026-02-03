import { Injector } from '@hwy-fm/di';
import { PipelineInstruction } from './instruction';
/**
 * Minimal compatibility interface for AbortSignal.
 * Allows passing native AbortSignal or custom implementations.
 */
export interface KernelAbortSignal {
    readonly aborted: boolean;
    readonly reason?: any;
    addEventListener?: (type: string, listener: (this: unknown, ev: unknown) => any, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener?: (type: string, listener: (this: unknown, ev: unknown) => any, options?: boolean | EventListenerOptions) => void;
}
export interface Context {
    identify: Record<string, any>;
    injector: Injector;
    /**
     * Cancellation signal for the current request.
     * Can be used to propagate timeout or client disconnect events.
     */
    signal?: KernelAbortSignal | AbortSignal;
    /**
     * Internal state of the execution pipeline.
     * @internal Should not be accessed directly by user code.
     */
    pipelineState?: PipelineState;
    raw: any;
    /**
     * Internal trace log for debugging purposes.
     * Only populated when KernelPolicy.debugMode is true.
     */
    _debugTrace?: Array<{
        type: 'START' | 'END' | 'SKIP' | 'ERROR';
        nodeId: string;
        slotName?: string;
        reason?: string;
        timestamp: number;
        duration?: number;
    }>;
    /**
     * Dynamically injects new instructions into the current pipeline execution.
     */
    inject(instructions: PipelineInstruction[]): Promise<void>;
}
export interface PipelineState {
    cursor: number;
    isStatic?: boolean;
    plan: Array<{
        executor: Function;
    }> | ReadonlyArray<{
        executor: Function;
    }>;
}
