import { __awaiter, __decorate } from "tslib";
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
const COMPILER_PROTOCOL = { name: 'COMPILER_TEST_PROTOCOL' };
const MOCK_PROTOCOL = { name: 'MOCK_PROTOCOL' };
// -------------------------------------------------------------
// MOCK COMPONENTS
// -------------------------------------------------------------
let MockMiddleware = class MockMiddleware {
    execute(ctx, next) { return next(); }
};
MockMiddleware = __decorate([
    Injectable()
], MockMiddleware);
let MockResolver = class MockResolver {
    resolve() {
        return (ctx, next) => next();
    }
};
MockResolver = __decorate([
    Injectable()
], MockResolver);
const ResolverToken = InjectorToken.get('ResolverToken');
// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------
function runCompilerSafetyTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🛡️ STARTING V4 COMPILER SAFETY TEST (Negative Testing) 🛡️');
        // Setup DI
        const injector = Injector.create([
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
        const registry = injector.get(Registry);
        const compiler = injector.get(PipelineCompiler);
        // =========================================================================
        // CASE 1: Circular Dependency
        // A -> after B
        // B -> after A
        // =========================================================================
        console.log('\n[Case 1] Testing Circular Dependency Detection...');
        try {
            const p1 = { name: 'CIRCULAR_PROTOCOL' };
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
            const seed = {
                slotName: 'SlotA',
                hostClass: MockMiddleware,
                propertyKey: 'handle',
                protocol: p1,
                aggregation: 'PROCESS_DEF',
                route: { path: '/circular', method: 'GET' }
            };
            yield compiler.build(seed, injector);
            console.error('❌ FAILED: Circular Dependency NOT detected! (Should have thrown error)');
        }
        catch (e) {
            if (e.message.includes('Circular Dependency') || e.message.includes('Cycle') || e.message.includes('Unresolved')) {
                console.log('✅ PASS: Detected Circular Dependency:', e.message);
            }
            else {
                console.warn('⚠️ WARNING: Error thrown but message not standard:', e.message);
            }
        }
        // =========================================================================
        // CASE 2: Cross-Stage Violation
        // Ingress Slot cannot depend on Process Slot
        // =========================================================================
        console.log('\n[Case 2] Testing Cross-Stage Topology Violation...');
        try {
            const p2 = { name: 'VIOLATION_PROTOCOL' };
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
            const seed = {
                slotName: 'ProcessSlot', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p2, aggregation: 'PROCESS_DEF',
                route: { path: '/violation', method: 'GET' }
            };
            yield compiler.build(seed, injector);
            console.error('❌ FAILED: Topology Violation NOT detected!');
        }
        catch (e) {
            if (e.message.includes('Topology Violation')) {
                console.log('✅ PASS: Detected Cross-Stage Violation:', e.message);
            }
            else {
                console.warn('⚠️ WARNING:', e.message);
            }
        }
        // =========================================================================
        // CASE 3: Dangling Anchor (Dependency on non-existent slot)
        // =========================================================================
        console.log('\n[Case 3] Testing Dangling Anchor...');
        try {
            const p3 = { name: 'DANGLING_PROTOCOL' };
            registry.registerSlot({
                definition: { name: 'RealSlot', stage: 'INGRESS', protocol: p3, anchors: { after: ['GhostSlot'] } },
                resolverToken: ResolverToken
            });
            // GhostSlot is NEVER defined
            registry.registerInstructions([
                { slotName: 'RealSlot', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p3 }
            ]);
            const seed = {
                slotName: 'RealSlot', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p3, aggregation: 'PROCESS_DEF',
                route: { path: '/dangling', method: 'GET' }
            };
            yield compiler.build(seed, injector);
            console.log('✅ PASS: Dangling Anchor ignored safely (as designed).');
            // Note: Kernel design might just ignore missing deps rather than crash. 
            // If it crashes, we adjust test expectation.
        }
        catch (e) {
            console.log('ℹ️ INFO: Kernel crashed on dangling anchor:', e.message);
        }
        // =========================================================================
        // CASE 4: Self Dependency (A depends on A)
        // =========================================================================
        console.log('\n[Case 4] Testing Self Dependency (Cycle of 1)...');
        try {
            const p4 = { name: 'SELF_PROTOCOL' };
            registry.registerSlot({
                definition: { name: 'SelfSlot', stage: 'INGRESS', protocol: p4, anchors: { after: ['SelfSlot'] } },
                resolverToken: ResolverToken
            });
            registry.registerInstructions([
                { slotName: 'SelfSlot', hostClass: MockMiddleware, componentToken: MockMiddleware, protocol: p4 }
            ]);
            const seed = {
                slotName: 'SelfSlot', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p4, aggregation: 'PROCESS_DEF',
                route: { path: '/self', method: 'GET' }
            };
            yield compiler.build(seed, injector);
            console.error('❌ FAILED: Self Dependency NOT detected!');
        }
        catch (e) {
            if (e.message.includes('Circular Dependency') || e.message.includes('Cycle') || e.message.includes('Unresolved')) {
                console.log('✅ PASS: Detected Self Dependency:', e.message);
            }
            else {
                console.warn('⚠️ WARNING:', e.message);
            }
        }
        // =========================================================================
        // CASE 5: Conflicting Constraints (A after B AND A before B)
        // =========================================================================
        console.log('\n[Case 5] Testing Conflicting Constraints (Simultaneous Before/After)...');
        try {
            const p5 = { name: 'CONFLICT_PROTOCOL' };
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
            const seed = {
                slotName: 'SlotA', hostClass: MockMiddleware, propertyKey: 'handle', protocol: p5, aggregation: 'PROCESS_DEF',
                route: { path: '/conflict', method: 'GET' }
            };
            yield compiler.build(seed, injector);
            console.error('❌ FAILED: Conflicting Constraints NOT detected!');
        }
        catch (e) {
            if (e.message.includes('Circular Dependency') || e.message.includes('Cycle') || e.message.includes('Unresolved')) {
                console.log('✅ PASS: Detected Conflicting Constraints (Cycle):', e.message);
            }
            else {
                console.warn('⚠️ WARNING:', e.message);
            }
        }
    });
}
runCompilerSafetyTest().catch(e => console.error(e));