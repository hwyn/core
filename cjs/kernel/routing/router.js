"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelRouter = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var policy_1 = require("../policy");
var strategy_1 = require("./strategy");
var aggregate_1 = require("./aggregate");
var KernelRouter = /** @class */ (function () {
    function KernelRouter(strategy) {
        this.strategy = strategy;
    }
    KernelRouter.prototype.add = function (route, runner, strategyToken) {
        if (!this.strategy) {
            policy_1.KernelPolicy.logger.warn('CoreRouter: No strategy configured. Route ignored.', route);
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
    KernelRouter = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__param(0, (0, di_1.Optional)()),
        tslib_1.__param(0, (0, di_1.Inject)(strategy_1.ROUTE_STRATEGY)),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof aggregate_1.AggregateRouterStrategy !== "undefined" && aggregate_1.AggregateRouterStrategy) === "function" ? _a : Object])
    ], KernelRouter);
    return KernelRouter;
}());
exports.KernelRouter = KernelRouter;