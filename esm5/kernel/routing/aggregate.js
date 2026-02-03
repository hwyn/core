import { __decorate, __metadata } from "tslib";
import { Injectable, Injector, Token, InjectFlags } from '@hwy-fm/di';
import { RuntimeConfigurationException } from "../exceptions/index.js";
import { ROUTE_STRATEGY } from "./strategy.js";
import { RadixRouterStrategy } from "./radix/strategy.js";
var AggregateRouterStrategy = /** @class */ (function () {
    function AggregateRouterStrategy(injector) {
        this.injector = injector;
    }
    AggregateRouterStrategy.prototype.add = function (route, runner, strategyToken) {
        this.dispatch('add', strategyToken).add(route, runner);
    };
    AggregateRouterStrategy.prototype.check = function (route, context, strategyToken) {
        return this.dispatch('check', strategyToken).check(route, context);
    };
    AggregateRouterStrategy.prototype.contains = function (pattern, target, strategyToken) {
        return this.dispatch('contains', strategyToken).contains(pattern, target);
    };
    AggregateRouterStrategy.prototype.match = function (context, strategyToken) {
        return this.dispatch('match', strategyToken).match(context);
    };
    AggregateRouterStrategy.prototype.dispatch = function (method, token) {
        if (token) {
            var strategy = this.injector.get(token, InjectFlags.Optional);
            if (!strategy || !strategy[method]) {
                throw new RuntimeConfigurationException("[AggregateRouterStrategy] Specified strategy not found: ".concat(String(token)));
            }
            return strategy;
        }
        return this.injector.get(RadixRouterStrategy);
    };
    var _a;
    AggregateRouterStrategy = __decorate([
        Token(ROUTE_STRATEGY),
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
    ], AggregateRouterStrategy);
    return AggregateRouterStrategy;
}());
export { AggregateRouterStrategy };