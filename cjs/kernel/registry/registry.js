"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var exceptions_1 = require("../exceptions");
var protocol_store_1 = require("./protocol-store");
var Registry = /** @class */ (function () {
    function Registry() {
        // The Registry now acts purely as a router/facade for ProtocolStores.
        // This physically enforces that data from different protocols never mix.
        this.stores = new Map();
    }
    Registry.prototype.getStore = function (protocol) {
        var store = this.stores.get(protocol);
        if (!store) {
            store = new protocol_store_1.ProtocolStore();
            this.stores.set(protocol, store);
        }
        return store;
    };
    Registry.prototype.registerInstructions = function (batch) {
        var e_1, _a;
        try {
            for (var batch_1 = tslib_1.__values(batch), batch_1_1 = batch_1.next(); !batch_1_1.done; batch_1_1 = batch_1.next()) {
                var inst = batch_1_1.value;
                // Safety check just in case types are loose somewhere
                if (!inst.protocol) {
                    throw new exceptions_1.RuntimeConfigurationException("Protocol Violation: Instruction for slot '".concat(inst.slotName, "' is missing a Protocol."), { slotName: inst.slotName });
                }
                this.getStore(inst.protocol).indexInstruction(inst);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (batch_1_1 && !batch_1_1.done && (_a = batch_1.return)) _a.call(batch_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Registry.prototype.registerSeeds = function (seeds) {
        var e_2, _a;
        try {
            for (var seeds_1 = tslib_1.__values(seeds), seeds_1_1 = seeds_1.next(); !seeds_1_1.done; seeds_1_1 = seeds_1.next()) {
                var s = seeds_1_1.value;
                this.getStore(s.protocol).registerSeed(s);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (seeds_1_1 && !seeds_1_1.done && (_a = seeds_1.return)) _a.call(seeds_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Registry.prototype.registerSlot = function (reg) {
        this.getStore(reg.definition.protocol).registerSlot(reg);
    };
    // --- Retrieval Methods (Delegates) ---
    Registry.prototype.getInstructionsBySlot = function (slotName, protocol) {
        return this.getStore(protocol).instructions.bySlot.get(slotName) || [];
    };
    Registry.prototype.getIngressSeeds = function (protocol) {
        var e_3, _a;
        if (protocol) {
            return this.getStore(protocol).seeds.ingress;
        }
        // Aggregate for Global Boot
        var all = [];
        try {
            for (var _b = tslib_1.__values(this.stores.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var store = _c.value;
                all.push.apply(all, tslib_1.__spreadArray([], tslib_1.__read(store.seeds.ingress), false));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return all;
    };
    Registry.prototype.getProcessSeeds = function (protocol) {
        var e_4, _a;
        if (protocol) {
            return this.getStore(protocol).seeds.process;
        }
        // Aggregate for Global Boot
        var all = [];
        try {
            for (var _b = tslib_1.__values(this.stores.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var store = _c.value;
                all.push.apply(all, tslib_1.__spreadArray([], tslib_1.__read(store.seeds.process), false));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return all;
    };
    Registry.prototype.getFloatingPatterns = function (protocol) {
        return this.getStore(protocol).instructions.floating;
    };
    Registry.prototype.getClassInstructions = function (target, protocol) {
        var classScope = this.getStore(protocol).scopeTree.get(target);
        return (classScope === null || classScope === void 0 ? void 0 : classScope.cls) || [];
    };
    Registry.prototype.getMethodInstructions = function (target, propertyKey, protocol) {
        var e_5, _a;
        if (protocol) {
            var classScope = this.getStore(protocol).scopeTree.get(target);
            return (classScope === null || classScope === void 0 ? void 0 : classScope.methods.get(propertyKey)) || [];
        }
        // Aggregate for Discovery/Bootstrap
        var all = [];
        try {
            for (var _b = tslib_1.__values(this.stores.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var store = _c.value;
                var classScope = store.scopeTree.get(target);
                var methodInsts = classScope === null || classScope === void 0 ? void 0 : classScope.methods.get(propertyKey);
                if (methodInsts) {
                    all.push.apply(all, tslib_1.__spreadArray([], tslib_1.__read(methodInsts), false));
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return all;
    };
    Registry.prototype.getSeeds = function (protocol) {
        return this.getIngressSeeds(protocol);
    };
    Registry.prototype.getSlotsByProfile = function (profile, protocol) {
        var e_6, _a, e_7, _b, e_8, _c;
        var store = this.getStore(protocol);
        var distinctSlots = new Set();
        try {
            // 1. Direct Matches
            for (var _d = tslib_1.__values(store.slots.values()), _e = _d.next(); !_e.done; _e = _d.next()) {
                var slot = _e.value;
                if (slot.profiles.includes(profile)) {
                    distinctSlots.add(slot);
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_6) throw e_6.error; }
        }
        try {
            // 2. Wildcard Matches
            for (var _f = tslib_1.__values(store.wildcardSlots), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = _g.value, slot = _h.slot, matchers = _h.matchers;
                if (distinctSlots.has(slot)) {
                    continue;
                }
                try {
                    for (var matchers_1 = (e_8 = void 0, tslib_1.__values(matchers)), matchers_1_1 = matchers_1.next(); !matchers_1_1.done; matchers_1_1 = matchers_1.next()) {
                        var matcher = matchers_1_1.value;
                        if (matcher.test(profile)) {
                            distinctSlots.add(slot);
                            break;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (matchers_1_1 && !matchers_1_1.done && (_c = matchers_1.return)) _c.call(matchers_1);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return Array.from(distinctSlots);
    };
    Registry.prototype.getSlotDefinition = function (name, protocol) {
        return this.getStore(protocol).slots.get(name);
    };
    Registry.prototype.getAllSlots = function (protocol) {
        return Array.from(this.getStore(protocol).slots.values());
    };
    Registry.prototype.getResolverToken = function (token, protocol) {
        return this.getStore(protocol).resolverTokens.get(token);
    };
    Registry = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], Registry);
    return Registry;
}());
exports.Registry = Registry;