"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineComposer = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var exceptions_1 = require("../exceptions");
var policy_1 = require("../policy");
var strategy_1 = require("../routing/strategy");
var aggregate_1 = require("../routing/aggregate");
var PipelineComposer = /** @class */ (function () {
    function PipelineComposer(router) {
        this.router = router;
    }
    PipelineComposer.prototype.compose = function (nodes) {
        if (!nodes || nodes.length === 0) {
            throw new exceptions_1.RuntimeConfigurationException('PipelineComposer: Cannot compose an empty pipeline. At least one node is required.');
        }
        var staticNodes = Object.freeze(tslib_1.__spreadArray([], tslib_1.__read(nodes), false));
        if (policy_1.KernelPolicy.debugMode) {
            return this.createDebugRunner(staticNodes);
        }
        return this.createProductionRunner(staticNodes);
    };
    PipelineComposer.prototype.createProductionRunner = function (staticNodes) {
        var _this = this;
        return function (context, next) {
            if (next === void 0) { next = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
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
                    throw new exceptions_1.PipelineAbortedException();
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
            if (next === void 0) { next = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
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
                    throw new exceptions_1.PipelineAbortedException();
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
        (_a = context._debugTrace) === null || _a === void 0 ? void 0 : _a.push(tslib_1.__assign({ type: type, nodeId: node.id, slotName: (_b = node.instruction) === null || _b === void 0 ? void 0 : _b.slotName, timestamp: Date.now() }, extra));
    };
    var _a;
    PipelineComposer = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__param(0, (0, di_1.Inject)(strategy_1.ROUTE_STRATEGY)),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof aggregate_1.AggregateRouterStrategy !== "undefined" && aggregate_1.AggregateRouterStrategy) === "function" ? _a : Object])
    ], PipelineComposer);
    return PipelineComposer;
}());
exports.PipelineComposer = PipelineComposer;