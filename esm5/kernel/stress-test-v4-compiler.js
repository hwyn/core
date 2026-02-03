import { __awaiter, __decorate, __generator } from "tslib";
import 'reflect-metadata';
import { Injector, Injectable, InjectorToken } from '@hwy-fm/di';
import { AggregateRouterStrategy } from "./routing/aggregate.js";
import { RadixRouterStrategy } from "./routing/radix/strategy.js";
import { ROUTE_STRATEGY } from "./routing/strategy.js";
import { PipelineCompiler } from "./compiler/pipeline.compiler.js";
import { PipelineSorter } from "./compiler/sorter.js";
import { NodeFactory } from "./compiler/factory.js";
import { PipelineComposer } from "./compiler/composer.js";
import { Registry } from "./registry/registry.js";
// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------
var COMPILER_PROTOCOL = { name: 'COMPILER_TEST_PROTOCOL' };
var MOCK_PROTOCOL = { name: 'MOCK_PROTOCOL' };
// -------------------------------------------------------------
// MOCK COMPONENTS
// -------------------------------------------------------------
var MockMiddleware = /** @class */ (function () {
    function MockMiddleware() {
    }
    MockMiddleware.prototype.execute = function (ctx, next) { return next(); };
    MockMiddleware = __decorate([
        Injectable()
    ], MockMiddleware);
    return MockMiddleware;
}());
var MockResolver = /** @class */ (function () {
    function MockResolver() {
    }
    MockResolver.prototype.resolve = function () {
        return function (ctx, next) { return next(); };
    };
    MockResolver = __decorate([
        Injectable()
    ], MockResolver);
    return MockResolver;
}());
var ResolverToken = InjectorToken.get('ResolverToken');
// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------
function runCompilerSafetyTest() {
    return __awaiter(this, void 0, void 0, function () {
        var injector, registry, compiler, p1, seed, e_1, p2, seed, e_2, p3, seed, e_3, p4, seed, e_4, p5, seed, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🛡️ STARTING V4 COMPILER SAFETY TEST (Negative Testing) 🛡️');
                    injector = Injector.create([
                        { provide: AggregateRouterStrategy, useClass: AggregateRouterStrategy },
                        { provide: ROUTE_STRATEGY, useExisting: AggregateRouterStrategy },
                        RadixRouterStrategy,
                        PipelineCompiler,
                        PipelineSorter,
                        NodeFactory,
                        PipelineComposer,
                        Registry,
                        MockMiddleware,
                        { provide: ResolverToken, useClass: MockResolver }
                    ]);
                    registry = injector.get(Registry);
                    compiler = injector.get(PipelineCompiler);
                    // =========================================================================
                    // CASE 1: Circular Dependency
                    // A -> after B
                    // B -> after A
                    // =========================================================================
                    console.log('\n[Case 1] Testing Circular Dependency Detection...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    p1 = { name: 'CIRCULAR_PROTOCOL' };
                    registry.registerSlot({
                        definition: { name: 'SlotA', stage: 'INGRESS', protocol: p1, anchors: { after: ['SlotB'] } },
                        resolverToken: ResolverToken
                    });
                    registry.registerSlot({
                        definition: { name: 'SlotB', stage: 'INGRESS', protocol: p1, anchors: { after: ['SlotA'] } },
                        resolverToken: ResolverToken
                    });
                    // Add instructions to trigger sort
                    registry.registerInstructions([
                        { slotName: 'SlotA', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p1 },
                        { slotName: 'SlotB', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p1 }
                    ]);
                    seed = {
                        slotName: 'SlotA',
                        hostClass: MockMiddleware,
                        propertyKey: 'handle',
                        protocol: p1,
                        aggregation: 'PROCESS_DEF',
                        route: { path: '/circular', method: 'GET' }
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 2:
                    _a.sent();
                    console.error('❌ FAILED: Circular Dependency NOT detected! (Should have thrown error)');
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    if (e_1.message.includes('Circular Dependency') || e_1.message.includes('Cycle') || e_1.message.includes('Unresolved')) {
                        console.log('✅ PASS: Detected Circular Dependency:', e_1.message);
                    }
                    else {
                        console.warn('⚠️ WARNING: Error thrown but message not standard:', e_1.message);
                    }
                    return [3 /*break*/, 4];
                case 4:
                    // =========================================================================
                    // CASE 2: Cross-Stage Violation
                    // Ingress Slot cannot depend on Process Slot
                    // =========================================================================
                    console.log('\n[Case 2] Testing Cross-Stage Topology Violation...');
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    p2 = { name: 'VIOLATION_PROTOCOL' };
                    registry.registerSlot({
                        definition: { name: 'IngressSlot', stage: 'INGRESS', protocol: p2, anchors: { after: ['ProcessSlot'] } },
                        resolverToken: ResolverToken
                    });
                    registry.registerSlot({
                        definition: { name: 'ProcessSlot', stage: 'PROCESS', protocol: p2 },
                        resolverToken: ResolverToken
                    });
                    registry.registerInstructions([
                        { slotName: 'IngressSlot', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p2 },
                        { slotName: 'ProcessSlot', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p2 }
                    ]);
                    seed = {
                        slotName: 'ProcessSlot', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p2, aggregation: 'PROCESS_DEF',
                        route: { path: '/violation', method: 'GET' }
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 6:
                    _a.sent();
                    console.error('❌ FAILED: Topology Violation NOT detected!');
                    return [3 /*break*/, 8];
                case 7:
                    e_2 = _a.sent();
                    if (e_2.message.includes('Topology Violation')) {
                        console.log('✅ PASS: Detected Cross-Stage Violation:', e_2.message);
                    }
                    else {
                        console.warn('⚠️ WARNING:', e_2.message);
                    }
                    return [3 /*break*/, 8];
                case 8:
                    // =========================================================================
                    // CASE 3: Dangling Anchor (Dependency on non-existent slot)
                    // =========================================================================
                    console.log('\n[Case 3] Testing Dangling Anchor...');
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    p3 = { name: 'DANGLING_PROTOCOL' };
                    registry.registerSlot({
                        definition: { name: 'RealSlot', stage: 'INGRESS', protocol: p3, anchors: { after: ['GhostSlot'] } },
                        resolverToken: ResolverToken
                    });
                    // GhostSlot is NEVER defined
                    registry.registerInstructions([
                        { slotName: 'RealSlot', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p3 }
                    ]);
                    seed = {
                        slotName: 'RealSlot', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p3, aggregation: 'PROCESS_DEF',
                        route: { path: '/dangling', method: 'GET' }
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 10:
                    _a.sent();
                    console.log('✅ PASS: Dangling Anchor ignored safely (as designed).');
                    return [3 /*break*/, 12];
                case 11:
                    e_3 = _a.sent();
                    console.log('ℹ️ INFO: Kernel crashed on dangling anchor:', e_3.message);
                    return [3 /*break*/, 12];
                case 12:
                    // =========================================================================
                    // CASE 4: Self Dependency (A depends on A)
                    // =========================================================================
                    console.log('\n[Case 4] Testing Self Dependency (Cycle of 1)...');
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    p4 = { name: 'SELF_PROTOCOL' };
                    registry.registerSlot({
                        definition: { name: 'SelfSlot', stage: 'INGRESS', protocol: p4, anchors: { after: ['SelfSlot'] } },
                        resolverToken: ResolverToken
                    });
                    registry.registerInstructions([
                        { slotName: 'SelfSlot', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p4 }
                    ]);
                    seed = {
                        slotName: 'SelfSlot', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p4, aggregation: 'PROCESS_DEF',
                        route: { path: '/self', method: 'GET' }
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 14:
                    _a.sent();
                    console.error('❌ FAILED: Self Dependency NOT detected!');
                    return [3 /*break*/, 16];
                case 15:
                    e_4 = _a.sent();
                    if (e_4.message.includes('Circular Dependency') || e_4.message.includes('Cycle') || e_4.message.includes('Unresolved')) {
                        console.log('✅ PASS: Detected Self Dependency:', e_4.message);
                    }
                    else {
                        console.warn('⚠️ WARNING:', e_4.message);
                    }
                    return [3 /*break*/, 16];
                case 16:
                    // =========================================================================
                    // CASE 5: Conflicting Constraints (A after B AND A before B)
                    // =========================================================================
                    console.log('\n[Case 5] Testing Conflicting Constraints (Simultaneous Before/After)...');
                    _a.label = 17;
                case 17:
                    _a.trys.push([17, 19, , 20]);
                    p5 = { name: 'CONFLICT_PROTOCOL' };
                    // Target Slot B
                    registry.registerSlot({
                        definition: { name: 'SlotB', stage: 'INGRESS', protocol: p5 },
                        resolverToken: ResolverToken
                    });
                    // Slot A says: I must be AFTER B, but also BEFORE B
                    // Logic: 'before B' -> A comes before B -> Edge A->B
                    // Logic: 'after B'  -> A comes after B  -> Edge B->A
                    // Result: A <-> B Cycle
                    registry.registerSlot({
                        definition: {
                            name: 'SlotA',
                            stage: 'INGRESS',
                            protocol: p5,
                            anchors: { after: ['SlotB'], before: ['SlotB'] }
                        },
                        resolverToken: ResolverToken
                    });
                    registry.registerInstructions([
                        { slotName: 'SlotA', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p5 },
                        { slotName: 'SlotB', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p5 }
                    ]);
                    seed = {
                        slotName: 'SlotA', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p5, aggregation: 'PROCESS_DEF',
                        route: { path: '/conflict', method: 'GET' }
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 18:
                    _a.sent();
                    console.error('❌ FAILED: Conflicting Constraints NOT detected!');
                    return [3 /*break*/, 20];
                case 19:
                    e_5 = _a.sent();
                    if (e_5.message.includes('Circular Dependency') || e_5.message.includes('Cycle') || e_5.message.includes('Unresolved')) {
                        console.log('✅ PASS: Detected Conflicting Constraints (Cycle):', e_5.message);
                    }
                    else {
                        console.warn('⚠️ WARNING:', e_5.message);
                    }
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
runCompilerSafetyTest().catch(function (e) { return console.error(e); });