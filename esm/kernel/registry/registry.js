import { __decorate } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { RuntimeConfigurationException } from "../exceptions/index.js";
import { ProtocolStore } from "./protocol-store.js";
let Registry = class Registry {
    constructor() {
        // The Registry now acts purely as a router/facade for ProtocolStores.
        // This physically enforces that data from different protocols never mix.
        this.stores = new Map();
    }
    getStore(protocol) {
        let store = this.stores.get(protocol);
        if (!store) {
            store = new ProtocolStore();
            this.stores.set(protocol, store);
        }
        return store;
    }
    registerInstructions(batch) {
        for (const inst of batch) {
            // Safety check just in case types are loose somewhere
            if (!inst.protocol) {
                throw new RuntimeConfigurationException(`Protocol Violation: Instruction for slot '${inst.slotName}' is missing a Protocol.`, { slotName: inst.slotName });
            }
            this.getStore(inst.protocol).indexInstruction(inst);
        }
    }
    registerSeeds(seeds) {
        for (const s of seeds) {
            this.getStore(s.protocol).registerSeed(s);
        }
    }
    registerSlot(reg) {
        this.getStore(reg.definition.protocol).registerSlot(reg);
    }
    // --- Retrieval Methods (Delegates) ---
    getInstructionsBySlot(slotName, protocol) {
        return this.getStore(protocol).instructions.bySlot.get(slotName) || [];
    }
    getIngressSeeds(protocol) {
        if (protocol) {
            return this.getStore(protocol).seeds.ingress;
        }
        // Aggregate for Global Boot
        const all = [];
        for (const store of this.stores.values()) {
            all.push(...store.seeds.ingress);
        }
        return all;
    }
    getProcessSeeds(protocol) {
        if (protocol) {
            return this.getStore(protocol).seeds.process;
        }
        // Aggregate for Global Boot
        const all = [];
        for (const store of this.stores.values()) {
            all.push(...store.seeds.process);
        }
        return all;
    }
    getFloatingPatterns(protocol) {
        return this.getStore(protocol).instructions.floating;
    }
    getClassInstructions(target, protocol) {
        const classScope = this.getStore(protocol).scopeTree.get(target);
        return (classScope === null || classScope === void 0 ? void 0 : classScope.cls) || [];
    }
    getMethodInstructions(target, propertyKey, protocol) {
        if (protocol) {
            const classScope = this.getStore(protocol).scopeTree.get(target);
            return (classScope === null || classScope === void 0 ? void 0 : classScope.methods.get(propertyKey)) || [];
        }
        // Aggregate for Discovery/Bootstrap
        const all = [];
        for (const store of this.stores.values()) {
            const classScope = store.scopeTree.get(target);
            const methodInsts = classScope === null || classScope === void 0 ? void 0 : classScope.methods.get(propertyKey);
            if (methodInsts) {
                all.push(...methodInsts);
            }
        }
        return all;
    }
    getSeeds(protocol) {
        return this.getIngressSeeds(protocol);
    }
    getSlotsByProfile(profile, protocol) {
        const store = this.getStore(protocol);
        const distinctSlots = new Set();
        // 1. Direct Matches
        for (const slot of store.slots.values()) {
            if (slot.profiles.includes(profile)) {
                distinctSlots.add(slot);
            }
        }
        // 2. Wildcard Matches
        for (const { slot, matchers } of store.wildcardSlots) {
            if (distinctSlots.has(slot)) {
                continue;
            }
            for (const matcher of matchers) {
                if (matcher.test(profile)) {
                    distinctSlots.add(slot);
                    break;
                }
            }
        }
        return Array.from(distinctSlots);
    }
    getSlotDefinition(name, protocol) {
        return this.getStore(protocol).slots.get(name);
    }
    getAllSlots(protocol) {
        return Array.from(this.getStore(protocol).slots.values());
    }
    getResolverToken(token, protocol) {
        return this.getStore(protocol).resolverTokens.get(token);
    }
};
Registry = __decorate([
    Injectable()
], Registry);
export { Registry };