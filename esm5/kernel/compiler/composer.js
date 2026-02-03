import { __assign, __awaiter, __decorate, __generator, __metadata, __param, __read, __spreadArray } from "tslib";
import { Inject, Injectable } from '@hwy-fm/di';
import { RuntimeConfigurationException, PipelineAbortedException } from "../exceptions/index.js";
import { KernelPolicy } from "../policy/index.js";
import { ROUTE_STRATEGY } from "../routing/strategy.js";
import { AggregateRouterStrategy } from "../routing/aggregate.js";
var PipelineComposer = /** @class */ (function () {
    function PipelineComposer(router) {
        this.router = router;
    }
    PipelineComposer.prototype.compose = function (nodes) {
        if (!nodes || nodes.length === 0) {
            throw new RuntimeConfigurationException('PipelineComposer: Cannot compose an empty pipeline. At least one node is required.');
        }
        var staticNodes = Object.freeze(__spreadArray([], __read(nodes), false));
        if (KernelPolicy.debugMode) {
            return this.createDebugRunner(staticNodes);
        }
        return this.createProductionRunner(staticNodes);
    };
    PipelineComposer.prototype.createProductionRunner = function (staticNodes) {
        var _this = this;
        return function (context, next) {
            if (next === void 0) { next = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); }; }
            context.pipelineState = {
                plan: staticNodes,
                cursor: 0,
                isStatic: true
            };
            var dispatch = function (i) {
                var _a, _b, _c;
                if ((_a = context.signal) === null || _a === void 0 ? void 0 : _a.aborted)
                    throw new PipelineAbortedException();
                var index = i;
                var currentPlan = staticNodes;
                if (!context.pipelineState.isStatic) {
                    currentPlan = context.pipelineState.plan;
                }
                while (index < currentPlan.length) {
                    var node = currentPlan[index];
                    var routeDef = (_b = node.instruction) === null || _b === void 0 ? void 0 : _b.route;
                    if (!routeDef || _this.router.check(routeDef, context, (_c = node.instruction) === null || _c === void 0 ? void 0 : _c.strategy)) {
                        break;
                    }
                    index++;
                }
                context.pipelineState.cursor = index;
                if (index >= currentPlan.length)
                    return next();
                return currentPlan[index].executor(context, function () { return dispatch(index + 1); });
            };
            return dispatch(0);
        };
    };
    PipelineComposer.prototype.createDebugRunner = function (staticNodes) {
        var _this = this;
        return function (context, next) {
            if (next === void 0) { next = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); }; }
            if (!context._debugTrace)
                context._debugTrace = [];
            context.pipelineState = {
                plan: staticNodes,
                cursor: 0,
                isStatic: true
            };
            var dispatch = function (i) {
                var _a, _b, _c, _d;
                if ((_a = context.signal) === null || _a === void 0 ? void 0 : _a.aborted)
                    throw new PipelineAbortedException();
                var currentNodes = ((_b = context.pipelineState) === null || _b === void 0 ? void 0 : _b.plan) || staticNodes;
                if (context.pipelineState)
                    context.pipelineState.cursor = i;
                if (i >= currentNodes.length)
                    return next();
                var node = currentNodes[i];
                var routeDef = (_c = node.instruction) === null || _c === void 0 ? void 0 : _c.route;
                var strategyToken = (_d = node.instruction) === null || _d === void 0 ? void 0 : _d.strategy;
                if (routeDef && !_this.router.check(routeDef, context, strategyToken)) {
                    _this.trace(context, node, 'SKIP', { reason: 'RouteMismatch' });
                    return dispatch(i + 1);
                }
                var nextNext = function () { return dispatch(i + 1); };
                return _this.runDebugNode(node, context, nextNext);
            };
            return dispatch(0);
        };
    };
    PipelineComposer.prototype.runDebugNode = function (node, context, next) {
        var _this = this;
        var startTime = Date.now();
        this.trace(context, node, 'START', { timestamp: startTime });
        // Safe Promise Wrapper
        return new Promise(function (resolve, reject) {
            try {
                resolve(node.executor(context, next));
            }
            catch (e) {
                reject(e);
            }
        })
            .then(function (res) { return res; }, function (err) {
            _this.trace(context, node, 'ERROR', { reason: err.message });
            throw err;
        })
            .finally(function () {
            _this.trace(context, node, 'END', { duration: Date.now() - startTime });
        });
    };
    PipelineComposer.prototype.trace = function (context, node, type, extra) {
        var _a, _b;
        (_a = context._debugTrace) === null || _a === void 0 ? void 0 : _a.push(__assign({ type: type, nodeId: node.id, slotName: (_b = node.instruction) === null || _b === void 0 ? void 0 : _b.slotName, timestamp: Date.now() }, extra));
    };
    var _a;
    PipelineComposer = __decorate([
        Injectable(),
        __param(0, Inject(ROUTE_STRATEGY)),
        __metadata("design:paramtypes", [typeof (_a = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _a : Object])
    ], PipelineComposer);
    return PipelineComposer;
}());
export { PipelineComposer };