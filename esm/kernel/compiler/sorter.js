var _a;
import { __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { KernelPolicy } from "../policy/index.js";
import { SlotStage } from "../types/index.js";
import { Registry } from "../registry/registry.js";
let PipelineSorter = class PipelineSorter {
    constructor(registry) {
        this.registry = registry;
        this.STAGES = [SlotStage.INGRESS, SlotStage.PROCESS, SlotStage.EGRESS];
        this.STAGE_WEIGHT = {
            [SlotStage.INGRESS]: 0,
            [SlotStage.PROCESS]: 1,
            [SlotStage.EGRESS]: 2
        };
        // Cache Key: Protocol -> Stage -> Sorted Slot Names
        this.cachedSequence = new Map();
    }
    groupAndSort(instructions, protocol) {
        var _a;
        const isDebug = KernelPolicy.debugMode;
        if (isDebug) {
            KernelPolicy.logger.log(`[PipelineSorter] Sorting ${instructions.length} instructions for Protocol: ${String(protocol)}.`);
        }
        if (!this.cachedSequence.has(protocol)) {
            this.computeSlotSequence(protocol);
        }
        const stageMap = this.cachedSequence.get(protocol);
        const buckets = new Map();
        for (const inst of instructions) {
            const def = this.registry.getSlotDefinition(inst.slotName, protocol);
            if (!def) {
                throw new Error(`PipelineSorter Error: Missing SlotDefinition for token '${inst.slotName}' in Protocol '${String(protocol)}'. ` +
                    `Target: ${(_a = inst.hostClass) === null || _a === void 0 ? void 0 : _a.name}.${String(inst.propertyKey || 'class')}`);
            }
            const list = buckets.get(inst.slotName) || [];
            list.push(inst);
            buckets.set(inst.slotName, list);
        }
        // 3. Assemble helpers
        const assembleStage = (stage) => {
            const slotOrder = stageMap.get(stage) || [];
            const result = [];
            for (const slotName of slotOrder) {
                const bucket = buckets.get(slotName);
                if (bucket) {
                    // Micro-sort within the slot bucket by 'order' property
                    if (bucket.length > 1) {
                        bucket.sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
                    }
                    for (const item of bucket) {
                        result.push(item);
                    }
                }
            }
            return result;
        };
        return {
            ingress: assembleStage(SlotStage.INGRESS),
            egress: assembleStage(SlotStage.EGRESS),
            process: assembleStage(SlotStage.PROCESS)
        };
    }
    sort(instructions, protocol) {
        const grouped = this.groupAndSort(instructions, protocol);
        return [
            ...grouped.ingress,
            ...grouped.process,
            ...grouped.egress
        ];
    }
    computeSlotSequence(protocol) {
        var _a;
        const allSlots = this.registry.getAllSlots(protocol);
        const stageGroups = new Map();
        this.STAGES.forEach(s => stageGroups.set(s, []));
        for (const def of allSlots) {
            (_a = stageGroups.get(def.stage)) === null || _a === void 0 ? void 0 : _a.push(def);
        }
        const calculatedMap = new Map();
        for (const stage of this.STAGES) {
            const slots = stageGroups.get(stage);
            const sortedNames = this.sortSlotsInStage(slots, stage, protocol);
            calculatedMap.set(stage, sortedNames);
        }
        this.cachedSequence.set(protocol, calculatedMap);
    }
    sortSlotsInStage(slots, stage, protocol) {
        var _a, _b, _c, _d;
        const heads = [];
        const bodies = [];
        const tails = [];
        for (const slot of slots) {
            const isHead = (_b = (_a = slot.anchors) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.includes('*');
            const isTail = (_d = (_c = slot.anchors) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.includes('*');
            if (isHead && isTail) {
                throw new Error(`Slot '${slot.name}' cannot claim both BEFORE ALL (*) and AFTER ALL (*) dependencies.`);
            }
            if (isHead) {
                heads.push(slot);
            }
            else if (isTail) {
                tails.push(slot);
            }
            else {
                bodies.push(slot);
            }
        }
        // Sort each zone independently
        const sortedHeads = this.performTopologicalSort(heads, stage, protocol);
        const sortedBodies = this.performTopologicalSort(bodies, stage, protocol);
        const sortedTails = this.performTopologicalSort(tails, stage, protocol);
        return [...sortedHeads, ...sortedBodies, ...sortedTails];
    }
    performTopologicalSort(slots, stage, protocol) {
        var _a, _b;
        const adj = new Map();
        const inDegree = new Map();
        const localNames = new Set(slots.map(s => s.name));
        // Initialize graph
        for (const slot of slots) {
            adj.set(slot.name, new Set());
            inDegree.set(slot.name, 0);
        }
        // Build edges & Validate Cross-Stage
        const currentWeight = this.STAGE_WEIGHT[stage];
        for (const slot of slots) {
            if ((_a = slot.anchors) === null || _a === void 0 ? void 0 : _a.before) {
                for (const targetName of slot.anchors.before) {
                    if (targetName === '*')
                        continue;
                    this.processDependency(slot, targetName, 'before', currentWeight, adj, inDegree, protocol, localNames.has(targetName));
                }
            }
            if ((_b = slot.anchors) === null || _b === void 0 ? void 0 : _b.after) {
                for (const targetName of slot.anchors.after) {
                    if (targetName === '*')
                        continue;
                    this.processDependency(slot, targetName, 'after', currentWeight, adj, inDegree, protocol, localNames.has(targetName));
                }
            }
        }
        const queue = [];
        const result = [];
        inDegree.forEach((deg, name) => {
            if (deg === 0)
                queue.push(name);
        });
        queue.sort();
        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current);
            const neighbors = adj.get(current);
            if (neighbors) {
                const sortedNeighbors = Array.from(neighbors).sort();
                for (const neighbor of sortedNeighbors) {
                    inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                    if (inDegree.get(neighbor) === 0) {
                        queue.push(neighbor);
                    }
                }
            }
        }
        if (result.length !== slots.length) {
            throw new Error(`Circular Dependency detected among Slots in stage ${stage} for Protocol ${String(protocol)}. Unresolved: ${slots.filter(s => !result.includes(s.name)).map(s => s.name).join(', ')}`);
        }
        return result;
    }
    processDependency(sourceDef, targetName, type, sourceWeight, adj, inDegree, protocol, isLocal) {
        const targetDef = this.registry.getSlotDefinition(targetName, protocol);
        if (!targetDef)
            return;
        const targetWeight = this.STAGE_WEIGHT[targetDef.stage];
        // 1. Validation (Always runs, regardless of whether target is local or not)
        if (type === 'before') {
            if (sourceWeight > targetWeight) {
                this.throwTopologyError(sourceDef, targetDef, type);
            }
        }
        else {
            if (sourceWeight < targetWeight) {
                this.throwTopologyError(sourceDef, targetDef, type);
            }
        }
        // 2. Graph Edges (Only if local to this sort group)
        if (isLocal && sourceWeight === targetWeight) {
            if (type === 'before') {
                this.addEdge(sourceDef.name, targetName, adj, inDegree);
            }
            else {
                this.addEdge(targetName, sourceDef.name, adj, inDegree);
            }
        }
    }
    addEdge(from, to, adj, inDegree) {
        const neighbors = adj.get(from);
        if (neighbors && !neighbors.has(to)) {
            neighbors.add(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
    }
    throwTopologyError(source, target, type) {
        throw new Error(`Topology Violation: Slot [${source.name}] in stage [${source.stage}] ` +
            `cannot declare '${type}' dependency on [${target.name}] in stage [${target.stage}]. ` +
            `This violates the physical pipeline order (Ingress -> Process -> Egress).`);
    }
};
PipelineSorter = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Registry !== "undefined" && Registry) === "function" ? _a : Object])
], PipelineSorter);
export { PipelineSorter };