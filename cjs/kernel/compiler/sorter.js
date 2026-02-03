"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineSorter = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var policy_1 = require("../policy");
var types_1 = require("../types");
var registry_1 = require("../registry/registry");
var PipelineSorter = /** @class */ (function () {
    function PipelineSorter(registry) {
        var _a;
        this.registry = registry;
        this.STAGES = [types_1.SlotStage.INGRESS, types_1.SlotStage.PROCESS, types_1.SlotStage.EGRESS];
        this.STAGE_WEIGHT = (_a = {},
            _a[types_1.SlotStage.INGRESS] = 0,
            _a[types_1.SlotStage.PROCESS] = 1,
            _a[types_1.SlotStage.EGRESS] = 2,
            _a);
        // Cache Key: Protocol -> Stage -> Sorted Slot Names
        this.cachedSequence = new Map();
    }
    PipelineSorter.prototype.groupAndSort = function (instructions, protocol) {
        var e_1, _a;
        var _b;
        var isDebug = policy_1.KernelPolicy.debugMode;
        if (isDebug) {
            policy_1.KernelPolicy.logger.log("[PipelineSorter] Sorting ".concat(instructions.length, " instructions for Protocol: ").concat(String(protocol), "."));
        }
        if (!this.cachedSequence.has(protocol)) {
            this.computeSlotSequence(protocol);
        }
        var stageMap = this.cachedSequence.get(protocol);
        var buckets = new Map();
        try {
            for (var instructions_1 = tslib_1.__values(instructions), instructions_1_1 = instructions_1.next(); !instructions_1_1.done; instructions_1_1 = instructions_1.next()) {
                var inst = instructions_1_1.value;
                var def = this.registry.getSlotDefinition(inst.slotName, protocol);
                if (!def) {
                    throw new Error("PipelineSorter Error: Missing SlotDefinition for token '".concat(inst.slotName, "' in Protocol '").concat(String(protocol), "'. ") +
                        "Target: ".concat((_b = inst.hostClass) === null || _b === void 0 ? void 0 : _b.name, ".").concat(String(inst.propertyKey || 'class')));
                }
                var list = buckets.get(inst.slotName) || [];
                list.push(inst);
                buckets.set(inst.slotName, list);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (instructions_1_1 && !instructions_1_1.done && (_a = instructions_1.return)) _a.call(instructions_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // 3. Assemble helpers
        var assembleStage = function (stage) {
            var e_2, _a, e_3, _b;
            var slotOrder = stageMap.get(stage) || [];
            var result = [];
            try {
                for (var slotOrder_1 = tslib_1.__values(slotOrder), slotOrder_1_1 = slotOrder_1.next(); !slotOrder_1_1.done; slotOrder_1_1 = slotOrder_1.next()) {
                    var slotName = slotOrder_1_1.value;
                    var bucket = buckets.get(slotName);
                    if (bucket) {
                        // Micro-sort within the slot bucket by 'order' property
                        if (bucket.length > 1) {
                            bucket.sort(function (a, b) { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
                        }
                        try {
                            for (var bucket_1 = (e_3 = void 0, tslib_1.__values(bucket)), bucket_1_1 = bucket_1.next(); !bucket_1_1.done; bucket_1_1 = bucket_1.next()) {
                                var item = bucket_1_1.value;
                                result.push(item);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (bucket_1_1 && !bucket_1_1.done && (_b = bucket_1.return)) _b.call(bucket_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (slotOrder_1_1 && !slotOrder_1_1.done && (_a = slotOrder_1.return)) _a.call(slotOrder_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        };
        return {
            ingress: assembleStage(types_1.SlotStage.INGRESS),
            egress: assembleStage(types_1.SlotStage.EGRESS),
            process: assembleStage(types_1.SlotStage.PROCESS)
        };
    };
    PipelineSorter.prototype.sort = function (instructions, protocol) {
        var grouped = this.groupAndSort(instructions, protocol);
        return tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(grouped.ingress), false), tslib_1.__read(grouped.process), false), tslib_1.__read(grouped.egress), false);
    };
    PipelineSorter.prototype.computeSlotSequence = function (protocol) {
        var e_4, _a, e_5, _b;
        var _c;
        var allSlots = this.registry.getAllSlots(protocol);
        var stageGroups = new Map();
        this.STAGES.forEach(function (s) { return stageGroups.set(s, []); });
        try {
            for (var allSlots_1 = tslib_1.__values(allSlots), allSlots_1_1 = allSlots_1.next(); !allSlots_1_1.done; allSlots_1_1 = allSlots_1.next()) {
                var def = allSlots_1_1.value;
                (_c = stageGroups.get(def.stage)) === null || _c === void 0 ? void 0 : _c.push(def);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (allSlots_1_1 && !allSlots_1_1.done && (_a = allSlots_1.return)) _a.call(allSlots_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var calculatedMap = new Map();
        try {
            for (var _d = tslib_1.__values(this.STAGES), _e = _d.next(); !_e.done; _e = _d.next()) {
                var stage = _e.value;
                var slots = stageGroups.get(stage);
                var sortedNames = this.sortSlotsInStage(slots, stage, protocol);
                calculatedMap.set(stage, sortedNames);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            }
            finally { if (e_5) throw e_5.error; }
        }
        this.cachedSequence.set(protocol, calculatedMap);
    };
    PipelineSorter.prototype.sortSlotsInStage = function (slots, stage, protocol) {
        var e_6, _a;
        var _b, _c, _d, _e;
        var heads = [];
        var bodies = [];
        var tails = [];
        try {
            for (var slots_1 = tslib_1.__values(slots), slots_1_1 = slots_1.next(); !slots_1_1.done; slots_1_1 = slots_1.next()) {
                var slot = slots_1_1.value;
                var isHead = (_c = (_b = slot.anchors) === null || _b === void 0 ? void 0 : _b.before) === null || _c === void 0 ? void 0 : _c.includes('*');
                var isTail = (_e = (_d = slot.anchors) === null || _d === void 0 ? void 0 : _d.after) === null || _e === void 0 ? void 0 : _e.includes('*');
                if (isHead && isTail) {
                    throw new Error("Slot '".concat(slot.name, "' cannot claim both BEFORE ALL (*) and AFTER ALL (*) dependencies."));
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
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (slots_1_1 && !slots_1_1.done && (_a = slots_1.return)) _a.call(slots_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        // Sort each zone independently
        var sortedHeads = this.performTopologicalSort(heads, stage, protocol);
        var sortedBodies = this.performTopologicalSort(bodies, stage, protocol);
        var sortedTails = this.performTopologicalSort(tails, stage, protocol);
        return tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(sortedHeads), false), tslib_1.__read(sortedBodies), false), tslib_1.__read(sortedTails), false);
    };
    PipelineSorter.prototype.performTopologicalSort = function (slots, stage, protocol) {
        var e_7, _a, e_8, _b, e_9, _c, e_10, _d, e_11, _e;
        var _f, _g;
        var adj = new Map();
        var inDegree = new Map();
        var localNames = new Set(slots.map(function (s) { return s.name; }));
        try {
            // Initialize graph
            for (var slots_2 = tslib_1.__values(slots), slots_2_1 = slots_2.next(); !slots_2_1.done; slots_2_1 = slots_2.next()) {
                var slot = slots_2_1.value;
                adj.set(slot.name, new Set());
                inDegree.set(slot.name, 0);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (slots_2_1 && !slots_2_1.done && (_a = slots_2.return)) _a.call(slots_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        // Build edges & Validate Cross-Stage
        var currentWeight = this.STAGE_WEIGHT[stage];
        try {
            for (var slots_3 = tslib_1.__values(slots), slots_3_1 = slots_3.next(); !slots_3_1.done; slots_3_1 = slots_3.next()) {
                var slot = slots_3_1.value;
                if ((_f = slot.anchors) === null || _f === void 0 ? void 0 : _f.before) {
                    try {
                        for (var _h = (e_9 = void 0, tslib_1.__values(slot.anchors.before)), _j = _h.next(); !_j.done; _j = _h.next()) {
                            var targetName = _j.value;
                            if (targetName === '*')
                                continue;
                            this.processDependency(slot, targetName, 'before', currentWeight, adj, inDegree, protocol, localNames.has(targetName));
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                }
                if ((_g = slot.anchors) === null || _g === void 0 ? void 0 : _g.after) {
                    try {
                        for (var _k = (e_10 = void 0, tslib_1.__values(slot.anchors.after)), _l = _k.next(); !_l.done; _l = _k.next()) {
                            var targetName = _l.value;
                            if (targetName === '*')
                                continue;
                            this.processDependency(slot, targetName, 'after', currentWeight, adj, inDegree, protocol, localNames.has(targetName));
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (_l && !_l.done && (_d = _k.return)) _d.call(_k);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (slots_3_1 && !slots_3_1.done && (_b = slots_3.return)) _b.call(slots_3);
            }
            finally { if (e_8) throw e_8.error; }
        }
        var queue = [];
        var result = [];
        inDegree.forEach(function (deg, name) {
            if (deg === 0)
                queue.push(name);
        });
        queue.sort();
        while (queue.length > 0) {
            var current = queue.shift();
            result.push(current);
            var neighbors = adj.get(current);
            if (neighbors) {
                var sortedNeighbors = Array.from(neighbors).sort();
                try {
                    for (var sortedNeighbors_1 = (e_11 = void 0, tslib_1.__values(sortedNeighbors)), sortedNeighbors_1_1 = sortedNeighbors_1.next(); !sortedNeighbors_1_1.done; sortedNeighbors_1_1 = sortedNeighbors_1.next()) {
                        var neighbor = sortedNeighbors_1_1.value;
                        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                        if (inDegree.get(neighbor) === 0) {
                            queue.push(neighbor);
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (sortedNeighbors_1_1 && !sortedNeighbors_1_1.done && (_e = sortedNeighbors_1.return)) _e.call(sortedNeighbors_1);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
        }
        if (result.length !== slots.length) {
            throw new Error("Circular Dependency detected among Slots in stage ".concat(stage, " for Protocol ").concat(String(protocol), ". Unresolved: ").concat(slots.filter(function (s) { return !result.includes(s.name); }).map(function (s) { return s.name; }).join(', ')));
        }
        return result;
    };
    PipelineSorter.prototype.processDependency = function (sourceDef, targetName, type, sourceWeight, adj, inDegree, protocol, isLocal) {
        var targetDef = this.registry.getSlotDefinition(targetName, protocol);
        if (!targetDef)
            return;
        var targetWeight = this.STAGE_WEIGHT[targetDef.stage];
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
    };
    PipelineSorter.prototype.addEdge = function (from, to, adj, inDegree) {
        var neighbors = adj.get(from);
        if (neighbors && !neighbors.has(to)) {
            neighbors.add(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
    };
    PipelineSorter.prototype.throwTopologyError = function (source, target, type) {
        throw new Error("Topology Violation: Slot [".concat(source.name, "] in stage [").concat(source.stage, "] ") +
            "cannot declare '".concat(type, "' dependency on [").concat(target.name, "] in stage [").concat(target.stage, "]. ") +
            "This violates the physical pipeline order (Ingress -> Process -> Egress).");
    };
    var _a;
    PipelineSorter = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof registry_1.Registry !== "undefined" && registry_1.Registry) === "function" ? _a : Object])
    ], PipelineSorter);
    return PipelineSorter;
}());
exports.PipelineSorter = PipelineSorter;