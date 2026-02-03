import { __awaiter } from "tslib";
import { SlotStage } from "../types/index.js";
import { PipelineSorter } from "./sorter.js";
import { Registry } from "../registry/registry.js";
// Mock Constants
const PROTO_A = Symbol('PROTO_A');
const PROTO_B = Symbol('PROTO_B');
// Mock Registry
class MockRegistry extends Registry {
    constructor() {
        super();
        // Protocol -> Name -> Def
        this.definitions = new Map();
        this.definitions = new Map();
    }
    registerMockSlot(def) {
        let bucket = this.definitions.get(def.protocol);
        if (!bucket) {
            bucket = new Map();
            this.definitions.set(def.protocol, bucket);
        }
        bucket.set(def.name, def);
    }
    getSlotDefinition(name, protocol) {
        var _a;
        return (_a = this.definitions.get(protocol)) === null || _a === void 0 ? void 0 : _a.get(name);
    }
    getAllSlots(protocol) {
        var _a;
        return Array.from(((_a = this.definitions.get(protocol)) === null || _a === void 0 ? void 0 : _a.values()) || []);
    }
}
// Test Runner
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- Starting PipelineSorter Tests (Protocol Aware) ---');
        let passed = 0;
        let total = 0;
        function assert(condition, message) {
            total++;
            if (!condition) {
                console.error(`❌ FAIL: ${message}`);
                process.exit(1);
            }
            else {
                console.log(`✅ PASS: ${message}`);
                passed++;
            }
        }
        function assertThrow(fn, expectedErrorPart, message) {
            total++;
            try {
                fn();
                console.error(`❌ FAIL: ${message} (Did not throw)`);
                process.exit(1);
            }
            catch (e) {
                if (e.message.includes(expectedErrorPart)) {
                    console.log(`✅ PASS: ${message}`);
                    passed++;
                }
                else {
                    console.error(`❌ FAIL: ${message} (Threw wrong error: ${e.message})`);
                    process.exit(1);
                }
            }
        }
        // --- Scenario 1: Same Stage Linear (A -> B) ---
        {
            const registry = new MockRegistry();
            registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_B'] }, profiles: ['default'] });
            registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            const instructions = [
                { slotName: 'SLOT_B', order: 0, protocol: PROTO_A },
                { slotName: 'SLOT_A', order: 0, protocol: PROTO_A }
            ];
            const sorted = sorter.sort(instructions, PROTO_A);
            assert(sorted[0].slotName === 'SLOT_A', 'Scenario 1: SLOT_A should be first');
            assert(sorted[1].slotName === 'SLOT_B', 'Scenario 1: SLOT_B should be second');
        }
        // --- Scenario 2: Same Stage Independent (Slot Name Priority in Pre-computation) ---
        {
            const registry = new MockRegistry();
            registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
            registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            // Instruction order (10 vs 5) is IGNORED across different slots now.
            // Hierarchy: Stage -> Topo Sort -> Name Sort -> Instructions inside Slot (by order).
            // SLOT_A vs SLOT_B: No deps. Names sort A then B.
            const instructions = [
                { slotName: 'SLOT_A', order: 10, protocol: PROTO_A },
                { slotName: 'SLOT_B', order: 5, protocol: PROTO_A }
            ];
            const sorted = sorter.sort(instructions, PROTO_A);
            assert(sorted[0].slotName === 'SLOT_A', 'Scenario 2: SLOT_A (Alpha First) should be first');
            assert(sorted[1].slotName === 'SLOT_B', 'Scenario 2: SLOT_B (Alpha Second) should be second');
        }
        // --- Scenario 3: Cross Stage (Ingress -> Process -> Egress) ---
        {
            const registry = new MockRegistry();
            registry.registerMockSlot({ name: 'INGRESS_A', protocol: PROTO_A, stage: SlotStage.INGRESS, profiles: ['default'] });
            registry.registerMockSlot({ name: 'PROCESS_A', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
            registry.registerMockSlot({ name: 'EGRESS_A', protocol: PROTO_A, stage: SlotStage.EGRESS, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            const instructions = [
                { slotName: 'EGRESS_A', protocol: PROTO_A },
                { slotName: 'INGRESS_A', protocol: PROTO_A },
                { slotName: 'PROCESS_A', protocol: PROTO_A }
            ];
            const sorted = sorter.sort(instructions, PROTO_A);
            assert(sorted[0].slotName === 'INGRESS_A', 'Scenario 3: INGRESS first');
            assert(sorted[1].slotName === 'PROCESS_A', 'Scenario 3: PROCESS second');
            assert(sorted[2].slotName === 'EGRESS_A', 'Scenario 3: EGRESS third');
        }
        // --- Scenario 4: Cross Stage Violation (Ingress depends on Process) ---
        {
            const registry = new MockRegistry();
            // INGRESS_A says "after PROCESS_A". But PROCESS is stage 1, INGRESS is 0. 0 < 1. 0 cannot be after 1.
            registry.registerMockSlot({ name: 'INGRESS_A', protocol: PROTO_A, stage: SlotStage.INGRESS, anchors: { after: ['PROCESS_A'] }, profiles: ['default'] });
            registry.registerMockSlot({ name: 'PROCESS_A', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            const instructions = [
                { slotName: 'INGRESS_A', protocol: PROTO_A },
                { slotName: 'PROCESS_A', protocol: PROTO_A }
            ];
            // This should throw Topology Violation
            assertThrow(() => sorter.sort(instructions, PROTO_A), 'Topology Violation', 'Scenario 4: Should detect basic stage violation');
        }
        // --- Scenario 5: Circular Dependency (A -> B -> A) within same stage ---
        {
            const registry = new MockRegistry();
            registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_B'] }, profiles: ['default'] });
            registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_A'] }, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            const instructions = [
                { slotName: 'SLOT_A', protocol: PROTO_A },
                { slotName: 'SLOT_B', protocol: PROTO_A }
            ];
            // This should throw Circular Dependency
            assertThrow(() => sorter.sort(instructions, PROTO_A), 'Circular Dependency', 'Scenario 5: Should detect circular dependency');
        }
        // --- Scenario 6: Mixed Instructions (Multiple instructions per slot) ---
        {
            const registry = new MockRegistry();
            registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_B'] }, profiles: ['default'] });
            registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            const instructions = [
                { slotName: 'SLOT_B', order: 2, propertyKey: 'p2', protocol: PROTO_A },
                { slotName: 'SLOT_A', order: 1, propertyKey: 'p1', protocol: PROTO_A },
                { slotName: 'SLOT_B', order: 1, propertyKey: 'p3', protocol: PROTO_A },
            ];
            // Expected: All A's, then All B's.
            // Within B: p3 (1) then p2 (2).
            const sorted = sorter.sort(instructions, PROTO_A);
            assert(sorted.length === 3, 'Scenario 6: Length 3');
            assert(sorted[0].slotName === 'SLOT_A', 'Scenario 6: A first');
            assert(sorted[1].slotName === 'SLOT_B', 'Scenario 6: B second');
            assert(sorted[2].slotName === 'SLOT_B', 'Scenario 6: B third');
            assert(sorted[1].propertyKey === 'p3', 'Scenario 6: B order 1 first');
            assert(sorted[2].propertyKey === 'p2', 'Scenario 6: B order 2 second');
        }
        // --- Scenario 7: Protocol Isolation (Same Slot Name, Different Logic) ---
        {
            const registry = new MockRegistry();
            // PROTO_A: AUTH is INGRESS
            registry.registerMockSlot({ name: 'AUTH', protocol: PROTO_A, stage: SlotStage.INGRESS, profiles: ['default'] });
            // PROTO_B: AUTH is PROCESS (Late Binding)
            registry.registerMockSlot({ name: 'AUTH', protocol: PROTO_B, stage: SlotStage.PROCESS, profiles: ['default'] });
            const sorter = new PipelineSorter(registry);
            // Instructions for PROTO_B
            const instructions = [
                { slotName: 'AUTH', protocol: PROTO_B }
            ];
            // Sort using PROTO_B context
            const resultB = sorter.groupAndSort(instructions, PROTO_B);
            // AUTH should be in PROCESS bucket
            assert(resultB.process.length === 1, 'Scenario 7: AUTH(B) is in PROCESS');
            assert(resultB.ingress.length === 0, 'Scenario 7: AUTH(B) is NOT in INGRESS');
            // Instructions for PROTO_A
            const instructionsA = [
                { slotName: 'AUTH', protocol: PROTO_A }
            ];
            // Sort using PROTO_A context
            const resultA = sorter.groupAndSort(instructionsA, PROTO_A);
            // AUTH should be in INGRESS bucket
            assert(resultA.ingress.length === 1, 'Scenario 7: AUTH(A) is in INGRESS');
            assert(resultA.process.length === 0, 'Scenario 7: AUTH(A) is NOT in PROCESS');
        }
        console.log(`\nAll ${total} tests passed!`);
    });
}
runTests().catch(e => console.error(e));