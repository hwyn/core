import { RuntimeConfigurationException } from "../exceptions/index.js";
/**
 * Internal storage for a single Protocol.
 * This ensures strict physical isolation of metadata between protocols.
 */
var ProtocolStore = /** @class */ (function () {
    function ProtocolStore() {
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
    ProtocolStore.prototype.indexInstruction = function (inst) {
        // 1. All Instructions (Aggregation)
        this.instructions.all.push(inst);
        // 2. By Slot (Direct Lookup)
        if (inst.slotName) {
            var bucket = this.instructions.bySlot.get(inst.slotName);
            if (!bucket) {
                bucket = [];
                this.instructions.bySlot.set(inst.slotName, bucket);
            }
            bucket.push(inst);
        }
        // 3. By Scope (Scope Tree)
        if (inst.hostClass) {
            var classScope = this.scopeTree.get(inst.hostClass);
            if (!classScope) {
                classScope = { cls: [], methods: new Map() };
                this.scopeTree.set(inst.hostClass, classScope);
            }
            if (inst.propertyKey) {
                var methodBucket = classScope.methods.get(inst.propertyKey) || [];
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
    };
    ProtocolStore.prototype.registerSlot = function (reg) {
        var _this = this;
        var _a = reg.definition, name = _a.name, profiles = _a.profiles;
        // Check collision
        if (this.slots.has(name)) {
            throw new RuntimeConfigurationException("Slot '".concat(name, "' is already registered for Protocol '").concat(String(reg.definition.protocol), "'. Duplicate registration detected."), { slotName: name });
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
        var wildcardPatterns = reg.definition.profiles.filter(function (p) { return p.includes('*'); });
        if (wildcardPatterns.length > 0) {
            var matchers = wildcardPatterns.map(function (p) { return _this.compilePattern(p); });
            this.wildcardSlots.push({ slot: reg.definition, matchers: matchers });
        }
    };
    ProtocolStore.prototype.registerSeed = function (s) {
        if (s.aggregation === 'INGRESS_ONLY') {
            this.seeds.ingress.push(s);
        }
        else if (s.aggregation === 'PROCESS_DEF') {
            this.seeds.process.push(s);
        }
    };
    ProtocolStore.prototype.isPattern = function (instruction) {
        return 'route' in instruction;
    };
    ProtocolStore.prototype.compilePattern = function (pattern) {
        if (pattern === '*')
            return /.*/;
        var regexBody = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
            .replace(/\*/g, '.*'); // Convert * to .*
        return new RegExp("^".concat(regexBody, "$"));
    };
    return ProtocolStore;
}());
export { ProtocolStore };