import { __decorate } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { KernelPolicy } from "../policy/index.js";
let KernelEventBus = class KernelEventBus {
    constructor() {
        this.listeners = new Map();
    }
    subscribe(event, handler) {
        try {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set());
            }
            const handlers = this.listeners.get(event);
            handlers.add(handler);
            return () => {
                try {
                    if (handlers)
                        handlers.delete(handler);
                }
                catch (e) {
                }
            };
        }
        catch (err) {
            this.logError('subscribe', err);
            return () => { };
        }
    }
    publish(event, payload) {
        const handlers = this.listeners.get(event);
        if (!handlers || handlers.size === 0)
            return;
        handlers.forEach(handler => {
            try {
                const result = handler(payload);
                if (result instanceof Promise) {
                    result.catch(err => this.logError(event, err));
                }
            }
            catch (err) {
                this.logError(event, err);
            }
        });
    }
    logError(event, err) {
        if (KernelPolicy.debugMode) {
            KernelPolicy.logger.error(`[KernelEventBus] Handler error for '${event}':`, err);
        }
    }
};
KernelEventBus = __decorate([
    Injectable()
], KernelEventBus);
export { KernelEventBus };