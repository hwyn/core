"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineCompiler = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var policy_1 = require("../policy");
var registry_1 = require("../registry/registry");
var aggregate_1 = require("../routing/aggregate");
var types_1 = require("../types");
var composer_1 = require("./composer");
var factory_1 = require("./factory");
var sorter_1 = require("./sorter");
var PipelineCompiler = /** @class */ (function () {
    function PipelineCompiler(composer, factory, registry, sorter, router) {
        this.composer = composer;
        this.factory = factory;
        this.registry = registry;
        this.sorter = sorter;
        this.router = router;
    }
    PipelineCompiler.prototype.build = function (seed, injector) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var definitions, nodes, _a, _b, instruction, node, e_1_1;
            var e_1, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        definitions = this.compile(seed);
                        nodes = [];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        _a = tslib_1.__values(definitions.instructions), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        instruction = _b.value;
                        return [4 /*yield*/, this.factory.create(instruction, injector, { seed: seed })];
                    case 3:
                        node = _d.sent();
                        nodes.push(node);
                        _d.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, {
                            nodes: nodes,
                            runner: this.composer.compose(nodes)
                        }];
                }
            });
        });
    };
    PipelineCompiler.prototype.compile = function (seed) {
        var _this = this;
        var rawBucket = new Map();
        this.registry.getSlotsByProfile(seed.profile || 'default', seed.protocol).forEach(function (slot) {
            rawBucket.set(slot.name, new Map());
        });
        var collector = function (instructions, priority) {
            return _this.collectRaw(rawBucket, instructions, priority, seed.protocol);
        };
        this.harvestSystemSlots(seed, rawBucket, collector);
        this.harvestProcessScope(seed, rawBucket, collector);
        var resolvedBucket = this.resolveConflicts(rawBucket);
        var sortedInstructions = this.sortResolved(resolvedBucket, seed.protocol);
        return this.materialize(seed, sortedInstructions);
    };
    PipelineCompiler.prototype.compileInstructions = function (instructions, injector) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var nodes, instructions_1, instructions_1_1, instruction, node, e_2_1;
            var e_2, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        nodes = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        instructions_1 = tslib_1.__values(instructions), instructions_1_1 = instructions_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!instructions_1_1.done) return [3 /*break*/, 5];
                        instruction = instructions_1_1.value;
                        return [4 /*yield*/, this.factory.create(instruction, injector)];
                    case 3:
                        node = _b.sent();
                        nodes.push(node);
                        _b.label = 4;
                    case 4:
                        instructions_1_1 = instructions_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (instructions_1_1 && !instructions_1_1.done && (_a = instructions_1.return)) _a.call(instructions_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, nodes];
                }
            });
        });
    };
    PipelineCompiler.prototype.collectRaw = function (bucket, instructions, priority, requiredProtocol) {
        var e_3, _a;
        try {
            for (var instructions_2 = tslib_1.__values(instructions), instructions_2_1 = instructions_2.next(); !instructions_2_1.done; instructions_2_1 = instructions_2.next()) {
                var inst = instructions_2_1.value;
                if (inst.protocol !== requiredProtocol) {
                    continue;
                }
                if (!bucket.has(inst.slotName)) {
                    continue;
                }
                var slotMap = bucket.get(inst.slotName);
                var existing = slotMap.get(inst);
                if (existing) {
                    if (priority > existing.priority) {
                        existing.priority = priority;
                    }
                }
                else {
                    slotMap.set(inst, { instruction: inst, priority: priority });
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (instructions_2_1 && !instructions_2_1.done && (_a = instructions_2.return)) _a.call(instructions_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    PipelineCompiler.prototype.harvestSystemSlots = function (seed, activeSlots, collect) {
        var e_4, _a, e_5, _b;
        try {
            for (var _c = tslib_1.__values(activeSlots.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var slotName = _d.value;
                var slotDef = this.registry.getSlotDefinition(slotName, seed.protocol);
                if (!slotDef || (slotDef.stage !== 'INGRESS' && slotDef.stage !== 'EGRESS')) {
                    continue;
                }
                var allInstructions = this.registry.getInstructionsBySlot(slotName, seed.protocol);
                try {
                    for (var allInstructions_1 = (e_5 = void 0, tslib_1.__values(allInstructions)), allInstructions_1_1 = allInstructions_1.next(); !allInstructions_1_1.done; allInstructions_1_1 = allInstructions_1.next()) {
                        var inst = allInstructions_1_1.value;
                        if (!inst.route) {
                            collect([inst], types_1.Priority.LOW);
                            continue;
                        }
                        if (this.isMatch(inst.route, seed.route, seed.strategy)) {
                            collect([inst], types_1.Priority.LOW);
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (allInstructions_1_1 && !allInstructions_1_1.done && (_b = allInstructions_1.return)) _b.call(allInstructions_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    PipelineCompiler.prototype.harvestProcessScope = function (seed, activeSlots, collect) {
        var e_6, _a;
        if (seed.aggregation !== 'PROCESS_DEF') {
            return;
        }
        var patterns = this.registry.getFloatingPatterns(seed.protocol);
        try {
            for (var patterns_1 = tslib_1.__values(patterns), patterns_1_1 = patterns_1.next(); !patterns_1_1.done; patterns_1_1 = patterns_1.next()) {
                var pattern = patterns_1_1.value;
                if (!activeSlots.has(pattern.slotName)) {
                    continue;
                }
                if (this.isMatch(pattern.route, seed.route, seed.strategy)) {
                    collect([pattern], types_1.Priority.LOW);
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (patterns_1_1 && !patterns_1_1.done && (_a = patterns_1.return)) _a.call(patterns_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var classInstructions = this.registry.getClassInstructions(seed.hostClass, seed.protocol);
        collect(classInstructions, types_1.Priority.MEDIUM);
        if (seed.propertyKey) {
            var methodInstructions = this.registry.getMethodInstructions(seed.hostClass, seed.propertyKey, seed.protocol);
            collect(methodInstructions, types_1.Priority.HIGH);
        }
    };
    PipelineCompiler.prototype.resolveConflicts = function (rawBucket) {
        var e_7, _a, e_8, _b;
        var _c;
        var resolvedBucket = new Map();
        try {
            for (var rawBucket_1 = tslib_1.__values(rawBucket), rawBucket_1_1 = rawBucket_1.next(); !rawBucket_1_1.done; rawBucket_1_1 = rawBucket_1.next()) {
                var _d = tslib_1.__read(rawBucket_1_1.value, 2), slotName = _d[0], map = _d[1];
                var candidates = Array.from(map.values());
                candidates.sort(function (a, b) {
                    var diffP = a.priority - b.priority;
                    if (diffP !== 0)
                        return diffP;
                    return (a.instruction.order || 0) - (b.instruction.order || 0);
                });
                var survivors = new Map();
                try {
                    for (var candidates_1 = (e_8 = void 0, tslib_1.__values(candidates)), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                        var candidate = candidates_1_1.value;
                        var _e = candidate.instruction, action = _e.action, enabled = _e.enabled, payload = _e.payload, componentToken = _e.componentToken;
                        var effectiveAction = action || types_1.InstructionAction.ADD;
                        switch (effectiveAction) {
                            case types_1.InstructionAction.RESET:
                                survivors.clear();
                                break;
                            case types_1.InstructionAction.EXCLUDE:
                                var targetToken = (_c = payload === null || payload === void 0 ? void 0 : payload.targetComponentToken) !== null && _c !== void 0 ? _c : componentToken;
                                if (!survivors.delete(targetToken)) {
                                    policy_1.KernelPolicy.logger.warn("[PipelineCompiler] \u26A0\uFE0F Config Warning: Slot '".concat(slotName, "' contains an EXCLUDE instruction for token '").concat(targetToken, "', but that token was not found in the pipeline. This may be a typo or the target instruction was never loaded."));
                                }
                                break;
                            case types_1.InstructionAction.ADD:
                            default:
                                if (enabled !== false) {
                                    survivors.set(componentToken, candidate);
                                }
                                break;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (candidates_1_1 && !candidates_1_1.done && (_b = candidates_1.return)) _b.call(candidates_1);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                if (survivors.size > 0) {
                    resolvedBucket.set(slotName, Array.from(survivors.values()));
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (rawBucket_1_1 && !rawBucket_1_1.done && (_a = rawBucket_1.return)) _a.call(rawBucket_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return resolvedBucket;
    };
    PipelineCompiler.prototype.sortResolved = function (resolvedMap, protocol) {
        var e_9, _a, e_10, _b;
        var allInstructions = [];
        try {
            // Flatten all surviving instructions
            for (var _c = tslib_1.__values(resolvedMap.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var list = _d.value;
                try {
                    for (var list_1 = (e_10 = void 0, tslib_1.__values(list)), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                        var item = list_1_1.value;
                        allInstructions.push(item.instruction);
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (list_1_1 && !list_1_1.done && (_b = list_1.return)) _b.call(list_1);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_9) throw e_9.error; }
        }
        // Delegate to the expert: PipelineSorter
        return this.sorter.sort(allInstructions, protocol);
    };
    PipelineCompiler.prototype.isMatch = function (patternRoute, seedRoute, strategyToken) {
        if (!patternRoute || !seedRoute)
            return false;
        return this.router.contains(patternRoute, seedRoute, strategyToken);
    };
    PipelineCompiler.prototype.materialize = function (seed, instructions) {
        return {
            seed: seed,
            instructions: instructions
        };
    };
    var _a, _b, _c, _d, _e;
    PipelineCompiler = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof composer_1.PipelineComposer !== "undefined" && composer_1.PipelineComposer) === "function" ? _a : Object, typeof (_b = typeof factory_1.NodeFactory !== "undefined" && factory_1.NodeFactory) === "function" ? _b : Object, typeof (_c = typeof registry_1.Registry !== "undefined" && registry_1.Registry) === "function" ? _c : Object, typeof (_d = typeof sorter_1.PipelineSorter !== "undefined" && sorter_1.PipelineSorter) === "function" ? _d : Object, typeof (_e = typeof aggregate_1.AggregateRouterStrategy !== "undefined" && aggregate_1.AggregateRouterStrategy) === "function" ? _e : Object])
    ], PipelineCompiler);
    return PipelineCompiler;
}());
exports.PipelineCompiler = PipelineCompiler;