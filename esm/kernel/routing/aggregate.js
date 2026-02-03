var _a;
import { __decorate, __metadata } from "tslib";
import { Injectable, Injector, Token, InjectFlags } from '@hwy-fm/di';
import { RuntimeConfigurationException } from "../exceptions/index.js";
import { ROUTE_STRATEGY } from "./strategy.js";
import { RadixRouterStrategy } from "./radix/strategy.js";
let AggregateRouterStrategy = class AggregateRouterStrategy {
    constructor(injector) {
        this.injector = injector;
    }
    add(route, runner, strategyToken) {
        this.dispatch('add', strategyToken).add(route, runner);
    }
    check(route, context, strategyToken) {
        return this.dispatch('check', strategyToken).check(route, context);
    }
    contains(pattern, target, strategyToken) {
        return this.dispatch('contains', strategyToken).contains(pattern, target);
    }
    match(context, strategyToken) {
        return this.dispatch('match', strategyToken).match(context);
    }
    dispatch(method, token) {
        if (token) {
            const strategy = this.injector.get(token, InjectFlags.Optional);
            if (!strategy || !strategy[method]) {
                throw new RuntimeConfigurationException(`[AggregateRouterStrategy] Specified strategy not found: ${String(token)}`);
            }
            return strategy;
        }
        return this.injector.get(RadixRouterStrategy);
    }
};
AggregateRouterStrategy = __decorate([
    Token(ROUTE_STRATEGY),
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
], AggregateRouterStrategy);
export { AggregateRouterStrategy };