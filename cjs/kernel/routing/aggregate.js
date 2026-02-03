"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRouterStrategy = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var exceptions_1 = require("../exceptions");
var strategy_1 = require("./strategy");
var strategy_2 = require("./radix/strategy");
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
            var strategy = this.injector.get(token, di_1.InjectFlags.Optional);
            if (!strategy || !strategy[method]) {
                throw new exceptions_1.RuntimeConfigurationException("[AggregateRouterStrategy] Specified strategy not found: ".concat(String(token)));
            }
            return strategy;
        }
        return this.injector.get(strategy_2.RadixRouterStrategy);
    };
    var _a;
    AggregateRouterStrategy = tslib_1.__decorate([
        (0, di_1.Token)(strategy_1.ROUTE_STRATEGY),
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _a : Object])
    ], AggregateRouterStrategy);
    return AggregateRouterStrategy;
}());
exports.AggregateRouterStrategy = AggregateRouterStrategy;