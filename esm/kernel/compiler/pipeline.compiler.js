var _a, _b, _c, _d, _e;
import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { KernelPolicy } from "../policy/index.js";
import { Registry } from "../registry/registry.js";
import { AggregateRouterStrategy } from "../routing/aggregate.js";
import { InstructionAction, Priority } from "../types/index.js";
import { PipelineComposer } from "./composer.js";
import { NodeFactory } from "./factory.js";
import { PipelineSorter } from "./sorter.js";
let PipelineCompiler = class PipelineCompiler {
    constructor(composer, factory, registry, sorter, router) {
        this.composer = composer;
        this.factory = factory;
        this.registry = registry;
        this.sorter = sorter;
        this.router = router;
    }
    build(seed, injector) {
        return __awaiter(this, void 0, void 0, function* () {
            const definitions = this.compile(seed);
            const nodes = [];
            for (const instruction of definitions.instructions) {
                const node = yield this.factory.create(instruction, injector, { seed });
                nodes.push(node);
            }
            return {
                nodes,
                runner: this.composer.compose(nodes)
            };
        });
    }
    compile(seed) {
        const rawBucket = new Map();
        this.registry.getSlotsByProfile(seed.profile || 'default', seed.protocol).forEach(slot => {
            rawBucket.set(slot.name, new Map());
        });
        const collector = (instructions, priority) => this.collectRaw(rawBucket, instructions, priority, seed.protocol);
        this.harvestSystemSlots(seed, rawBucket, collector);
        this.harvestProcessScope(seed, rawBucket, collector);
        const resolvedBucket = this.resolveConflicts(rawBucket);
        const sortedInstructions = this.sortResolved(resolvedBucket, seed.protocol);
        return this.materialize(seed, sortedInstructions);
    }
    compileInstructions(instructions, injector) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodes = [];
            for (const instruction of instructions) {
                const node = yield this.factory.create(instruction, injector);
                nodes.push(node);
            }
            return nodes;
        });
    }
    collectRaw(bucket, instructions, priority, requiredProtocol) {
        for (const inst of instructions) {
            if (inst.protocol !== requiredProtocol) {
                continue;
            }
            if (!bucket.has(inst.slotName)) {
                continue;
            }
            const slotMap = bucket.get(inst.slotName);
            const existing = slotMap.get(inst);
            if (existing) {
                if (priority > existing.priority) {
                    existing.priority = priority;
                }
            }
            else {
                slotMap.set(inst, { instruction: inst, priority });
            }
        }
    }
    harvestSystemSlots(seed, activeSlots, collect) {
        for (const slotName of activeSlots.keys()) {
            const slotDef = this.registry.getSlotDefinition(slotName, seed.protocol);
            if (!slotDef || (slotDef.stage !== 'INGRESS' && slotDef.stage !== 'EGRESS')) {
                continue;
            }
            const allInstructions = this.registry.getInstructionsBySlot(slotName, seed.protocol);
            for (const inst of allInstructions) {
                if (!inst.route) {
                    collect([inst], Priority.LOW);
                    continue;
                }
                if (this.isMatch(inst.route, seed.route, seed.strategy)) {
                    collect([inst], Priority.LOW);
                }
            }
        }
    }
    harvestProcessScope(seed, activeSlots, collect) {
        if (seed.aggregation !== 'PROCESS_DEF') {
            return;
        }
        const patterns = this.registry.getFloatingPatterns(seed.protocol);
        for (const pattern of patterns) {
            if (!activeSlots.has(pattern.slotName)) {
                continue;
            }
            if (this.isMatch(pattern.route, seed.route, seed.strategy)) {
                collect([pattern], Priority.LOW);
            }
        }
        const classInstructions = this.registry.getClassInstructions(seed.hostClass, seed.protocol);
        collect(classInstructions, Priority.MEDIUM);
        if (seed.propertyKey) {
            const methodInstructions = this.registry.getMethodInstructions(seed.hostClass, seed.propertyKey, seed.protocol);
            collect(methodInstructions, Priority.HIGH);
        }
    }
    resolveConflicts(rawBucket) {
        var _a;
        const resolvedBucket = new Map();
        for (const [slotName, map] of rawBucket) {
            const candidates = Array.from(map.values());
            candidates.sort((a, b) => {
                const diffP = a.priority - b.priority;
                if (diffP !== 0)
                    return diffP;
                return (a.instruction.order || 0) - (b.instruction.order || 0);
            });
            const survivors = new Map();
            for (const candidate of candidates) {
                const { action, enabled, payload, componentToken } = candidate.instruction;
                const effectiveAction = action || InstructionAction.ADD;
                switch (effectiveAction) {
                    case InstructionAction.RESET:
                        survivors.clear();
                        break;
                    case InstructionAction.EXCLUDE:
                        const targetToken = (_a = payload === null || payload === void 0 ? void 0 : payload.targetComponentToken) !== null && _a !== void 0 ? _a : componentToken;
                        if (!survivors.delete(targetToken)) {
                            KernelPolicy.logger.warn(`[PipelineCompiler] ⚠️ Config Warning: Slot '${slotName}' contains an EXCLUDE instruction for token '${targetToken}', but that token was not found in the pipeline. This may be a typo or the target instruction was never loaded.`);
                        }
                        break;
                    case InstructionAction.ADD:
                    default:
                        if (enabled !== false) {
                            survivors.set(componentToken, candidate);
                        }
                        break;
                }
            }
            if (survivors.size > 0) {
                resolvedBucket.set(slotName, Array.from(survivors.values()));
            }
        }
        return resolvedBucket;
    }
    sortResolved(resolvedMap, protocol) {
        const allInstructions = [];
        // Flatten all surviving instructions
        for (const list of resolvedMap.values()) {
            for (const item of list) {
                allInstructions.push(item.instruction);
            }
        }
        // Delegate to the expert: PipelineSorter
        return this.sorter.sort(allInstructions, protocol);
    }
    isMatch(patternRoute, seedRoute, strategyToken) {
        if (!patternRoute || !seedRoute)
            return false;
        return this.router.contains(patternRoute, seedRoute, strategyToken);
    }
    materialize(seed, instructions) {
        return {
            seed,
            instructions
        };
    }
};
PipelineCompiler = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PipelineComposer !== "undefined" && PipelineComposer) === "function" ? _a : Object, typeof (_b = typeof NodeFactory !== "undefined" && NodeFactory) === "function" ? _b : Object, typeof (_c = typeof Registry !== "undefined" && Registry) === "function" ? _c : Object, typeof (_d = typeof PipelineSorter !== "undefined" && PipelineSorter) === "function" ? _d : Object, typeof (_e = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _e : Object])
], PipelineCompiler);
export { PipelineCompiler };