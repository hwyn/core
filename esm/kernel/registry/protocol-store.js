import { RuntimeConfigurationException } from "../exceptions/index.js";
/**
 * Internal storage for a single Protocol.
 * This ensures strict physical isolation of metadata between protocols.
 */
export class ProtocolStore {
    constructor() {
        this.seeds = { process: [], ingress: [] };
        this.instructions = {
            all: [],
            bySlot: new Map(),
            floating: []
        };
        this.slots = new Map();
        this.wildcardSlots = [];
        // Key: SlotName
        this.resolverTokens = new Map();
        // Key: HostClass
        this.scopeTree = new Map();
    }
    indexInstruction(inst) {
        // 1. All Instructions (Aggregation)
        this.instructions.all.push(inst);
        // 2. By Slot (Direct Lookup)
        if (inst.slotName) {
            let bucket = this.instructions.bySlot.get(inst.slotName);
            if (!bucket) {
                bucket = [];
                this.instructions.bySlot.set(inst.slotName, bucket);
            }
            bucket.push(inst);
        }
        // 3. By Scope (Scope Tree)
        if (inst.hostClass) {
            let classScope = this.scopeTree.get(inst.hostClass);
            if (!classScope) {
                classScope = { cls: [], methods: new Map() };
                this.scopeTree.set(inst.hostClass, classScope);
            }
            if (inst.propertyKey) {
                const methodBucket = classScope.methods.get(inst.propertyKey) || [];
                methodBucket.push(inst);
                classScope.methods.set(inst.propertyKey, methodBucket);
            }
            else {
                classScope.cls.push(inst);
            }
        }
        // 4. Floating Patterns
        else if (this.isPattern(inst) && inst.route) {
            this.instructions.floating.push(inst);
        }
    }
    registerSlot(reg) {
        const { name, profiles } = reg.definition;
        // Check collision
        if (this.slots.has(name)) {
            throw new RuntimeConfigurationException(`Slot '${name}' is already registered for Protocol '${String(reg.definition.protocol)}'. Duplicate registration detected.`, { slotName: name });
        }
        // Default profile
        if (!profiles || profiles.length === 0) {
            reg.definition.profiles = ['default'];
        }
        // Store Definition
        this.slots.set(name, reg.definition);
        // Register Resolver Token (Scoped to this store, so just Name is enough)
        this.resolverTokens.set(name, reg.resolverToken);
        // Build Wildcard Index
        // Note: We access reg.definition.profiles directly as we might have mutated it above
        const wildcardPatterns = reg.definition.profiles.filter((p) => p.includes('*'));
        if (wildcardPatterns.length > 0) {
            const matchers = wildcardPatterns.map((p) => this.compilePattern(p));
            this.wildcardSlots.push({ slot: reg.definition, matchers });
        }
    }
    registerSeed(s) {
        if (s.aggregation === 'INGRESS_ONLY') {
            this.seeds.ingress.push(s);
        }
        else if (s.aggregation === 'PROCESS_DEF') {
            this.seeds.process.push(s);
        }
    }
    isPattern(instruction) {
        return 'route' in instruction;
    }
    compilePattern(pattern) {
        if (pattern === '*')
            return /.*/;
        const regexBody = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
            .replace(/\*/g, '.*'); // Convert * to .*
        return new RegExp(`^${regexBody}$`);
    }
}