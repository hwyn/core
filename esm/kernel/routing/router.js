var _a;
import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable, Optional } from '@hwy-fm/di';
import { KernelPolicy } from "../policy/index.js";
import { ROUTE_STRATEGY } from "./strategy.js";
import { AggregateRouterStrategy } from "./aggregate.js";
let KernelRouter = class KernelRouter {
    constructor(strategy) {
        this.strategy = strategy;
    }
    add(route, runner, strategyToken) {
        if (!this.strategy) {
            KernelPolicy.logger.warn('CoreRouter: No strategy configured. Route ignored.', route);
            return;
        }
        this.strategy.add(route, runner, strategyToken);
    }
    match(context, strategyToken) {
        if (!this.strategy) {
            return undefined;
        }
        const result = this.strategy.match(context, strategyToken);
        if (result) {
            if (result.params) {
                context.identify['params'] = result.params;
            }
            return result.runner;
        }
        return undefined;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
};
KernelRouter = __decorate([
    Injectable(),
    __param(0, Optional()),
    __param(0, Inject(ROUTE_STRATEGY)),
    __metadata("design:paramtypes", [typeof (_a = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _a : Object])
], KernelRouter);
export { KernelRouter };