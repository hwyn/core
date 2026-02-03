var _a, _b, _c;
import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable } from '@hwy-fm/di';
import { AggregateRouterStrategy } from "../routing/aggregate.js";
import { ROUTE_STRATEGY } from "../routing/strategy.js";
import { ResourceNotFoundException, PipelineAbortedException, KernelException, ExceptionCode, ServerBusyException } from "../exceptions/index.js";
import { RuntimePipelineUtils } from "./pipeline.utils.js";
import { KernelPolicy } from "../policy/index.js";
import { KernelEventBus } from "../event/index.js";
let KernelDispatcher = class KernelDispatcher {
    constructor(router, pipelineUtils, bus) {
        this.router = router;
        this.pipelineUtils = pipelineUtils;
        this.bus = bus;
        this.activeRequests = 0;
        this.shuttingDown = false;
        this.shutdownResolvers = [];
    }
    shutdown() {
        return __awaiter(this, arguments, void 0, function* (timeout = 30000) {
            if (this.shuttingDown)
                return;
            this.shuttingDown = true;
            if (this.activeRequests === 0)
                return;
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    reject(new KernelException(ExceptionCode.TIMEOUT, 'Shutdown timed out while waiting for requests to drain.'));
                }, timeout);
                this.shutdownResolvers.push(() => {
                    clearTimeout(timer);
                    resolve();
                });
            });
        });
    }
    dispatch(context, strategyToken, next) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkAvailability();
            this.activeRequests++;
            const startTime = Date.now();
            this.bus.publish('pipe:start', { context, timestamp: startTime });
            let success = false;
            let error;
            try {
                const runner = this.prepareContext(context, strategyToken);
                const result = yield this.monitorExecution(context, runner, next);
                success = true;
                return result;
            }
            catch (err) {
                error = err;
                throw err;
            }
            finally {
                this.finalizeRequest(context, startTime, success, error);
            }
        });
    }
    checkAvailability() {
        if (this.shuttingDown) {
            throw new ServerBusyException('Server is shutting down');
        }
        if (KernelPolicy.maxConcurrency > 0 && this.activeRequests >= KernelPolicy.maxConcurrency) {
            this.bus.publish('sys:busy', { active: this.activeRequests, max: KernelPolicy.maxConcurrency });
            throw new ServerBusyException();
        }
    }
    prepareContext(context, strategyToken) {
        context.inject = (instructions) => this.pipelineUtils.inject(context, instructions);
        const result = this.router.match(context, strategyToken);
        if (!result) {
            throw new ResourceNotFoundException('Route', `${context.identify.method} ${context.identify.path}`);
        }
        if (result.params) {
            context.identify['params'] = result.params;
        }
        return result.runner;
    }
    monitorExecution(context, runner, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const timeout = KernelPolicy.defaultTimeout;
            const controller = this.ensureSignal(context, timeout);
            let timer;
            try {
                if (controller && timeout > 0) {
                    timer = setTimeout(() => controller.abort(), timeout);
                }
                return yield runner(context, next);
            }
            catch (err) {
                if (err instanceof PipelineAbortedException) {
                    const reason = ((_a = controller === null || controller === void 0 ? void 0 : controller.signal) === null || _a === void 0 ? void 0 : _a.aborted) ? 'timeout' : 'abort';
                    this.bus.publish('pipe:abort', { reason, context });
                    if (reason === 'timeout') {
                        throw new KernelException(ExceptionCode.TIMEOUT, 'Pipeline execution timed out.');
                    }
                }
                throw err;
            }
            finally {
                if (timer)
                    clearTimeout(timer);
            }
        });
    }
    finalizeRequest(context, startTime, success, error) {
        this.activeRequests--;
        this.bus.publish('pipe:end', { context, duration: Date.now() - startTime, success, error });
        if (this.shuttingDown && this.activeRequests === 0) {
            this.shutdownResolvers.forEach(r => r());
            this.shutdownResolvers = [];
        }
    }
    ensureSignal(context, timeout) {
        if (timeout <= 0) {
            return null;
        }
        let controller;
        if (typeof AbortController !== 'undefined') {
            controller = new AbortController();
        }
        else {
            controller = {
                signal: { aborted: false },
                abort() { this.signal.aborted = true; }
            };
        }
        if (context.signal) {
            if (context.signal.aborted) {
                controller.abort();
            }
            else {
                // Safe check for addEventListener
                if (typeof context.signal.addEventListener === 'function') {
                    context.signal.addEventListener('abort', () => controller.abort());
                }
            }
        }
        context.signal = controller.signal;
        return controller;
    }
};
KernelDispatcher = __decorate([
    Injectable(),
    __param(0, Inject(ROUTE_STRATEGY)),
    __metadata("design:paramtypes", [typeof (_a = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _a : Object, typeof (_b = typeof RuntimePipelineUtils !== "undefined" && RuntimePipelineUtils) === "function" ? _b : Object, typeof (_c = typeof KernelEventBus !== "undefined" && KernelEventBus) === "function" ? _c : Object])
], KernelDispatcher);
export { KernelDispatcher };