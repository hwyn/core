import { KernelEventMap, KernelEvent, KernelEventHandler } from './types';
export declare class KernelEventBus {
    private listeners;
    subscribe<K extends KernelEvent>(event: K, handler: KernelEventHandler<K>): () => void;
    publish<K extends KernelEvent>(event: K, payload: KernelEventMap[K]): void;
    private logError;
}
