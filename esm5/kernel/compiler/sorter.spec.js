import { __awaiter, __extends, __generator } from "tslib";
import { SlotStage } from "../types/index.js";
import { PipelineSorter } from "./sorter.js";
import { Registry } from "../registry/registry.js";
// Mock Constants
var PROTO_A = Symbol('PROTO_A');
var PROTO_B = Symbol('PROTO_B');
// Mock Registry
var MockRegistry = /** @class */ (function (_super) {
    __extends(MockRegistry, _super);
    function MockRegistry() {
        var _this = _super.call(this) || this;
        // Protocol -> Name -> Def
        _this.definitions = new Map();
        _this.definitions = new Map();
        return _this;
    }
    MockRegistry.prototype.registerMockSlot = function (def) {
        var bucket = this.definitions.get(def.protocol);
        if (!bucket) {
            bucket = new Map();
            this.definitions.set(def.protocol, bucket);
        }
        bucket.set(def.name, def);
    };
    MockRegistry.prototype.getSlotDefinition = function (name, protocol) {
        var _a;
        return (_a = this.definitions.get(protocol)) === null || _a === void 0 ? void 0 : _a.get(name);
    };
    MockRegistry.prototype.getAllSlots = function (protocol) {
        var _a;
        return Array.from(((_a = this.definitions.get(protocol)) === null || _a === void 0 ? void 0 : _a.values()) || []);
    };
    return MockRegistry;
}(Registry));
// Test Runner
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        function assert(condition, message) {
            total++;
            if (!condition) {
                console.error("\u274C FAIL: ".concat(message));
                process.exit(1);
            }
            else {
                console.log("\u2705 PASS: ".concat(message));
                passed++;
            }
        }
        function assertThrow(fn, expectedErrorPart, message) {
            total++;
            try {
                fn();
                console.error("\u274C FAIL: ".concat(message, " (Did not throw)"));
                process.exit(1);
            }
            catch (e) {
                if (e.message.includes(expectedErrorPart)) {
                    console.log("\u2705 PASS: ".concat(message));
                    passed++;
                }
                else {
                    console.error("\u274C FAIL: ".concat(message, " (Threw wrong error: ").concat(e.message, ")"));
                    process.exit(1);
                }
            }
        }
        var passed, total, registry, sorter, instructions, sorted, registry, sorter, instructions, sorted, registry, sorter, instructions, sorted, registry, sorter_1, instructions_1, registry, sorter_2, instructions_2, registry, sorter, instructions, sorted, registry, sorter, instructions, resultB, instructionsA, resultA;
        return __generator(this, function (_a) {
            console.log('--- Starting PipelineSorter Tests (Protocol Aware) ---');
            passed = 0;
            total = 0;
            // --- Scenario 1: Same Stage Linear (A -> B) ---
            {
                registry = new MockRegistry();
                registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_B'] }, profiles: ['default'] });
                registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
                sorter = new PipelineSorter(registry);
                instructions = [
                    { slotName: 'SLOT_B', order: 0, protocol: PROTO_A },
                    { slotName: 'SLOT_A', order: 0, protocol: PROTO_A }
                ];
                sorted = sorter.sort(instructions, PROTO_A);
                assert(sorted[0].slotName === 'SLOT_A', 'Scenario 1: SLOT_A should be first');
                assert(sorted[1].slotName === 'SLOT_B', 'Scenario 1: SLOT_B should be second');
            }
            // --- Scenario 2: Same Stage Independent (Slot Name Priority in Pre-computation) ---
            {
                registry = new MockRegistry();
                registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
                registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
                sorter = new PipelineSorter(registry);
                instructions = [
                    { slotName: 'SLOT_A', order: 10, protocol: PROTO_A },
                    { slotName: 'SLOT_B', order: 5, protocol: PROTO_A }
                ];
                sorted = sorter.sort(instructions, PROTO_A);
                assert(sorted[0].slotName === 'SLOT_A', 'Scenario 2: SLOT_A (Alpha First) should be first');
                assert(sorted[1].slotName === 'SLOT_B', 'Scenario 2: SLOT_B (Alpha Second) should be second');
            }
            // --- Scenario 3: Cross Stage (Ingress -> Process -> Egress) ---
            {
                registry = new MockRegistry();
                registry.registerMockSlot({ name: 'INGRESS_A', protocol: PROTO_A, stage: SlotStage.INGRESS, profiles: ['default'] });
                registry.registerMockSlot({ name: 'PROCESS_A', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
                registry.registerMockSlot({ name: 'EGRESS_A', protocol: PROTO_A, stage: SlotStage.EGRESS, profiles: ['default'] });
                sorter = new PipelineSorter(registry);
                instructions = [
                    { slotName: 'EGRESS_A', protocol: PROTO_A },
                    { slotName: 'INGRESS_A', protocol: PROTO_A },
                    { slotName: 'PROCESS_A', protocol: PROTO_A }
                ];
                sorted = sorter.sort(instructions, PROTO_A);
                assert(sorted[0].slotName === 'INGRESS_A', 'Scenario 3: INGRESS first');
                assert(sorted[1].slotName === 'PROCESS_A', 'Scenario 3: PROCESS second');
                assert(sorted[2].slotName === 'EGRESS_A', 'Scenario 3: EGRESS third');
            }
            // --- Scenario 4: Cross Stage Violation (Ingress depends on Process) ---
            {
                registry = new MockRegistry();
                // INGRESS_A says "after PROCESS_A". But PROCESS is stage 1, INGRESS is 0. 0 < 1. 0 cannot be after 1.
                registry.registerMockSlot({ name: 'INGRESS_A', protocol: PROTO_A, stage: SlotStage.INGRESS, anchors: { after: ['PROCESS_A'] }, profiles: ['default'] });
                registry.registerMockSlot({ name: 'PROCESS_A', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
                sorter_1 = new PipelineSorter(registry);
                instructions_1 = [
                    { slotName: 'INGRESS_A', protocol: PROTO_A },
                    { slotName: 'PROCESS_A', protocol: PROTO_A }
                ];
                // This should throw Topology Violation
                assertThrow(function () { return sorter_1.sort(instructions_1, PROTO_A); }, 'Topology Violation', 'Scenario 4: Should detect basic stage violation');
            }
            // --- Scenario 5: Circular Dependency (A -> B -> A) within same stage ---
            {
                registry = new MockRegistry();
                registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_B'] }, profiles: ['default'] });
                registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_A'] }, profiles: ['default'] });
                sorter_2 = new PipelineSorter(registry);
                instructions_2 = [
                    { slotName: 'SLOT_A', protocol: PROTO_A },
                    { slotName: 'SLOT_B', protocol: PROTO_A }
                ];
                // This should throw Circular Dependency
                assertThrow(function () { return sorter_2.sort(instructions_2, PROTO_A); }, 'Circular Dependency', 'Scenario 5: Should detect circular dependency');
            }
            // --- Scenario 6: Mixed Instructions (Multiple instructions per slot) ---
            {
                registry = new MockRegistry();
                registry.registerMockSlot({ name: 'SLOT_A', protocol: PROTO_A, stage: SlotStage.PROCESS, anchors: { before: ['SLOT_B'] }, profiles: ['default'] });
                registry.registerMockSlot({ name: 'SLOT_B', protocol: PROTO_A, stage: SlotStage.PROCESS, profiles: ['default'] });
                sorter = new PipelineSorter(registry);
                instructions = [
                    { slotName: 'SLOT_B', order: 2, propertyKey: 'p2', protocol: PROTO_A },
                    { slotName: 'SLOT_A', order: 1, propertyKey: 'p1', protocol: PROTO_A },
                    { slotName: 'SLOT_B', order: 1, propertyKey: 'p3', protocol: PROTO_A },
                ];
                sorted = sorter.sort(instructions, PROTO_A);
                assert(sorted.length === 3, 'Scenario 6: Length 3');
                assert(sorted[0].slotName === 'SLOT_A', 'Scenario 6: A first');
                assert(sorted[1].slotName === 'SLOT_B', 'Scenario 6: B second');
                assert(sorted[2].slotName === 'SLOT_B', 'Scenario 6: B third');
                assert(sorted[1].propertyKey === 'p3', 'Scenario 6: B order 1 first');
                assert(sorted[2].propertyKey === 'p2', 'Scenario 6: B order 2 second');
            }
            // --- Scenario 7: Protocol Isolation (Same Slot Name, Different Logic) ---
            {
                registry = new MockRegistry();
                // PROTO_A: AUTH is INGRESS
                registry.registerMockSlot({ name: 'AUTH', protocol: PROTO_A, stage: SlotStage.INGRESS, profiles: ['default'] });
                // PROTO_B: AUTH is PROCESS (Late Binding)
                registry.registerMockSlot({ name: 'AUTH', protocol: PROTO_B, stage: SlotStage.PROCESS, profiles: ['default'] });
                sorter = new PipelineSorter(registry);
                instructions = [
                    { slotName: 'AUTH', protocol: PROTO_B }
                ];
                resultB = sorter.groupAndSort(instructions, PROTO_B);
                // AUTH should be in PROCESS bucket
                assert(resultB.process.length === 1, 'Scenario 7: AUTH(B) is in PROCESS');
                assert(resultB.ingress.length === 0, 'Scenario 7: AUTH(B) is NOT in INGRESS');
                instructionsA = [
                    { slotName: 'AUTH', protocol: PROTO_A }
                ];
                resultA = sorter.groupAndSort(instructionsA, PROTO_A);
                // AUTH should be in INGRESS bucket
                assert(resultA.ingress.length === 1, 'Scenario 7: AUTH(A) is in INGRESS');
                assert(resultA.process.length === 0, 'Scenario 7: AUTH(A) is NOT in PROCESS');
            }
            console.log("\nAll ".concat(total, " tests passed!"));
            return [2 /*return*/];
        });
    });
}
runTests().catch(function (e) { return console.error(e); });