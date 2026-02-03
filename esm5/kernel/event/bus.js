import { __decorate } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { KernelPolicy } from "../policy/index.js";
var KernelEventBus = /** @class */ (function () {
    function KernelEventBus() {
        this.listeners = new Map();
    }
    KernelEventBus.prototype.subscribe = function (event, handler) {
        try {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set());
            }
            var handlers_1 = this.listeners.get(event);
            handlers_1.add(handler);
            return function () {
                try {
                    if (handlers_1)
                        handlers_1.delete(handler);
                }
                catch (e) {
                }
            };
        }
        catch (err) {
            this.logError('subscribe', err);
            return function () { };
        }
    };
    KernelEventBus.prototype.publish = function (event, payload) {
        var _this = this;
        var handlers = this.listeners.get(event);
        if (!handlers || handlers.size === 0)
            return;
        handlers.forEach(function (handler) {
            try {
                var result = handler(payload);
                if (result instanceof Promise) {
                    result.catch(function (err) { return _this.logError(event, err); });
                }
            }
            catch (err) {
                _this.logError(event, err);
            }
        });
    };
    KernelEventBus.prototype.logError = function (event, err) {
        if (KernelPolicy.debugMode) {
            KernelPolicy.logger.error("[KernelEventBus] Handler error for '".concat(event, "':"), err);
        }
    };
    KernelEventBus = __decorate([
        Injectable()
    ], KernelEventBus);
    return KernelEventBus;
}());
export { KernelEventBus };