import { Context } from '../types';
export interface KernelEventMap {
    /** Pipeline start */
    'pipe:start': {
        context: Context;
        timestamp: number;
    };
    /** Pipeline finish (success/fail) */
    'pipe:end': {
        context: Context;
        duration: number;
        success: boolean;
        error?: Error;
    };
    /** System overload */
    'sys:busy': {
        active: number;
        max: number;
    };
    /** Circuit break (timeout/abort) */
    'pipe:abort': {
        reason: 'timeout' | 'abort';
        context: Context;
    };
}
export type KernelEvent = keyof KernelEventMap;
export type KernelEventHandler<K extends KernelEvent> = (payload: KernelEventMap[K]) => void | Promise<void>;
