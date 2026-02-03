var _a;
import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable } from '@hwy-fm/di';
import { RuntimeConfigurationException, PipelineAbortedException } from "../exceptions/index.js";
import { KernelPolicy } from "../policy/index.js";
import { ROUTE_STRATEGY } from "../routing/strategy.js";
import { AggregateRouterStrategy } from "../routing/aggregate.js";
let PipelineComposer = class PipelineComposer {
    constructor(router) {
        this.router = router;
    }
    compose(nodes) {
        if (!nodes || nodes.length === 0) {
            throw new RuntimeConfigurationException('PipelineComposer: Cannot compose an empty pipeline. At least one node is required.');
        }
        const staticNodes = Object.freeze([...nodes]);
        if (KernelPolicy.debugMode) {
            return this.createDebugRunner(staticNodes);
        }
        return this.createProductionRunner(staticNodes);
    }
    createProductionRunner(staticNodes) {
        return (context, next = () => __awaiter(this, void 0, void 0, function* () { })) => {
            context.pipelineState = {
                plan: staticNodes,
                cursor: 0,
                isStatic: true
            };
            const dispatch = (i) => {
                var _a, _b, _c;
                if ((_a = context.signal) === null || _a === void 0 ? void 0 : _a.aborted)
                    throw new PipelineAbortedException();
                let index = i;
                let currentPlan = staticNodes;
                if (!context.pipelineState.isStatic) {
                    currentPlan = context.pipelineState.plan;
                }
                while (index < currentPlan.length) {
                    const node = currentPlan[index];
                    const routeDef = (_b = node.instruction) === null || _b === void 0 ? void 0 : _b.route;
                    if (!routeDef || this.router.check(routeDef, context, (_c = node.instruction) === null || _c === void 0 ? void 0 : _c.strategy)) {
                        break;
                    }
                    index++;
                }
                context.pipelineState.cursor = index;
                if (index >= currentPlan.length)
                    return next();
                return currentPlan[index].executor(context, () => dispatch(index + 1));
            };
            return dispatch(0);
        };
    }
    createDebugRunner(staticNodes) {
        return (context, next = () => __awaiter(this, void 0, void 0, function* () { })) => {
            if (!context._debugTrace)
                context._debugTrace = [];
            context.pipelineState = {
                plan: staticNodes,
                cursor: 0,
                isStatic: true
            };
            const dispatch = (i) => {
                var _a, _b, _c, _d;
                if ((_a = context.signal) === null || _a === void 0 ? void 0 : _a.aborted)
                    throw new PipelineAbortedException();
                const currentNodes = ((_b = context.pipelineState) === null || _b === void 0 ? void 0 : _b.plan) || staticNodes;
                if (context.pipelineState)
                    context.pipelineState.cursor = i;
                if (i >= currentNodes.length)
                    return next();
                const node = currentNodes[i];
                const routeDef = (_c = node.instruction) === null || _c === void 0 ? void 0 : _c.route;
                const strategyToken = (_d = node.instruction) === null || _d === void 0 ? void 0 : _d.strategy;
                if (routeDef && !this.router.check(routeDef, context, strategyToken)) {
                    this.trace(context, node, 'SKIP', { reason: 'RouteMismatch' });
                    return dispatch(i + 1);
                }
                const nextNext = () => dispatch(i + 1);
                return this.runDebugNode(node, context, nextNext);
            };
            return dispatch(0);
        };
    }
    runDebugNode(node, context, next) {
        const startTime = Date.now();
        this.trace(context, node, 'START', { timestamp: startTime });
        // Safe Promise Wrapper
        return new Promise((resolve, reject) => {
            try {
                resolve(node.executor(context, next));
            }
            catch (e) {
                reject(e);
            }
        })
            .then((res) => res, (err) => {
            this.trace(context, node, 'ERROR', { reason: err.message });
            throw err;
        })
            .finally(() => {
            this.trace(context, node, 'END', { duration: Date.now() - startTime });
        });
    }
    trace(context, node, type, extra) {
        var _a, _b;
        (_a = context._debugTrace) === null || _a === void 0 ? void 0 : _a.push(Object.assign({ type: type, nodeId: node.id, slotName: (_b = node.instruction) === null || _b === void 0 ? void 0 : _b.slotName, timestamp: Date.now() }, extra));
    }
};
PipelineComposer = __decorate([
    Injectable(),
    __param(0, Inject(ROUTE_STRATEGY)),
    __metadata("design:paramtypes", [typeof (_a = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _a : Object])
], PipelineComposer);
export { PipelineComposer };