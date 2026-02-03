import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable, Optional } from '@hwy-fm/di';
import { KernelPolicy } from "../policy/index.js";
import { ROUTE_STRATEGY } from "./strategy.js";
import { AggregateRouterStrategy } from "./aggregate.js";
var KernelRouter = /** @class */ (function () {
    function KernelRouter(strategy) {
        this.strategy = strategy;
    }
    KernelRouter.prototype.add = function (route, runner, strategyToken) {
        if (!this.strategy) {
            KernelPolicy.logger.warn('CoreRouter: No strategy configured. Route ignored.', route);
            return;
        }
        this.strategy.add(route, runner, strategyToken);
    };
    KernelRouter.prototype.match = function (context, strategyToken) {
        if (!this.strategy) {
            return undefined;
        }
        var result = this.strategy.match(context, strategyToken);
        if (result) {
            if (result.params) {
                context.identify['params'] = result.params;
            }
            return result.runner;
        }
        return undefined;
    };
    KernelRouter.prototype.setStrategy = function (strategy) {
        this.strategy = strategy;
    };
    var _a;
    KernelRouter = __decorate([
        Injectable(),
        __param(0, Optional()),
        __param(0, Inject(ROUTE_STRATEGY)),
        __metadata("design:paramtypes", [typeof (_a = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _a : Object])
    ], KernelRouter);
    return KernelRouter;
}());
export { KernelRouter };