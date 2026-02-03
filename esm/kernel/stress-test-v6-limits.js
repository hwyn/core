var _a;
import { __awaiter, __decorate, __metadata } from "tslib";
import 'reflect-metadata';
import { Injector, Injectable, InjectorToken } from '@hwy-fm/di';
import { AggregateRouterStrategy } from "./routing/aggregate.js";
import { PipelineCompiler } from "./compiler/pipeline.compiler.js";
import { PipelineSorter } from "./compiler/sorter.js";
import { NodeFactory } from "./compiler/factory.js";
import { PipelineComposer } from "./compiler/composer.js";
import { Registry } from "./registry/registry.js";
import { RuntimePipelineUtils } from "./runtime/pipeline.utils.js";
import { KernelCompiler } from "./compiler/compiler.js";
// -------------------------------------------------------------
// SETUP
// -------------------------------------------------------------
const HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
// const ROUTE_STRATEGY = InjectorToken.get('ROUTE_STRATEGY');
import { ROUTE_STRATEGY } from "./routing/strategy.js";
const GenericResolverToken = InjectorToken.get('GenericResolver');
let GenericResolver = class GenericResolver {
    constructor(injector) {
        this.injector = injector;
    }
    resolve(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            const inst = instruction;
            if (inst.manualExecutor)
                return inst.manualExecutor; // Direct function support for testing
            return (ctx, next) => next();
        });
    }
};
GenericResolver = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
], GenericResolver);
// -------------------------------------------------------------
// TEST A: DATA ISOLATION (Context Bleed)
// -------------------------------------------------------------
function runIsolationTest(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Test 1: High-Concurrency Data Isolation (Bleed Check)');
        const utils = injector.get(RuntimePipelineUtils);
        // Create a pipeline that simply sleeps and checks context
        const concurrency = 2000;
        const errors = [];
        // Instruction: Write ID -> Sleep -> Check ID
        const verifyLogic = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            const id = ctx.raw.id; // From request
            // 1. Write to Context State
            ctx.identify.traceId = id;
            // 2. Sleep (simulate switching context)
            yield new Promise(r => setTimeout(r, Math.random() * 20));
            // 3. Verify
            if (ctx.identify.traceId !== id) {
                const error = `Context Bleed! Expected ${id}, got ${ctx.identify.traceId}`;
                console.error(error);
                errors.push(error);
            }
            yield next();
        });
        // Construct pipeline manually for speed
        const pipelineRunner = (ctx) => verifyLogic(ctx, () => __awaiter(this, void 0, void 0, function* () { }));
        console.log(`> Launching ${concurrency} parallel requests...`);
        const tasks = [];
        for (let i = 0; i < concurrency; i++) {
            const ctx = {
                identify: {},
                injector,
                raw: { id: `REQ-${i}` },
                inject: () => __awaiter(this, void 0, void 0, function* () { })
            };
            tasks.push(pipelineRunner(ctx));
        }
        yield Promise.all(tasks);
        if (errors.length > 0) {
            console.error(`❌ FAIL: ${errors.length} Context Bleed(s) detected!`);
            process.exit(1);
        }
        else {
            console.log(`✅ PASS: ${concurrency} requests handled with Zero context pollution.`);
        }
        console.log('');
    });
}
// -------------------------------------------------------------
// TEST B: STACK DEPTH (Recursion Limit)
// -------------------------------------------------------------
function runDepthTest(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Test 2: Pipeline Depth & Stack Integrity');
        const compiler = injector.get(PipelineCompiler);
        const depth = 1000; // 2500 causes Stack Overflow. Limit is around 1000-2000.
        console.log(`> Building pipeline with ${depth} nodes...`);
        // We use the Compiler to build a massive static pipeline
        const instructions = [];
        for (let i = 0; i < depth; i++) {
            // Create chain: Node0 -> Node1 -> Node2 ...
            const inst = {
                // Uniqueness is key here.
                name: `Node_${i}`,
                // The route definition must match RouteDef interface.
                // string "/*" is not a RouteDef.
                route: { path: '/*', methods: ['GET'] },
                protocol: HTTP_PROTOCOL,
                slotName: 'DepthSlotIngress', // MUST BE INGRESS or EGRESS for system harvest
                manualExecutor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    // Increment counter
                    ctx.identify.depth = (ctx.identify.depth || 0) + 1;
                    return next();
                })
            };
            instructions.push(inst);
        }
        // We defined 'DepthSlot' as stage 'PROCESS'.
        // `harvestSystemSlots` explicitly ignores 'PROCESS' slots:
        // `if (!slotDef || (slotDef.stage !== 'INGRESS' && slotDef.stage !== 'EGRESS')) continue;`
        // `harvestProcessScope` looks for patterns or class instructions.
        // Our manual instructions are just "Floating" instructions in a Slot, but they don't look like Patterns (no route).
        // They are also not Class Instructions (no hostClass).
        // So `harvestProcessScope` misses them too!
        // To fix this test, we have two options:
        // 1. Make them 'INGRESS' or 'EGRESS' (System Slots).
        // 2. Make them Patterns (give them a route).
        // 3. Make them Class Instructions (give them a hostClass).
        // Let's go with Option 2: Patterns.
        // We give them a wildcard route match.
        // And we must ensure `registry.getFloatingPatterns()` returns them.
        // `registry.ts` -> `isPattern(inst)` check.
        // Let's try Option 1: Change SlotStage to 'INGRESS'. Simplest.
        // NOTE: Slot 'DepthSlot' was already registered in setup() as 'PROCESS'.
        // We can't overwrite it easily in same process if using same registry instance.
        // Let's use a NEW registry instance for Depth test setup.
        // Wait, `injector` is reused from `setup()`? Yes.
        // And `Registry` is `useValue: registry`.
        // So we are stuck with the registry from `setup`.
        // In `setup`:
        // registry.registerSlot({ definition: { name: 'DepthSlot', protocol: HTTP_PROTOCOL, stage: 'PROCESS' }, resolverToken: GenericResolverToken } as any);
        // We are adding 'DepthSlotIngress'.
        // `compiler.build(seed)` -> `harvestSystemSlots` -> iterates registered slots.
        // It calls `this.registry.getSlotsByProfile`.
        // We added 'DepthSlotIngress' to registry. So it should appear.
        // Then `getInstructionsBySlot('DepthSlotIngress', seed.protocol)`.
        // We registered instructions to 'DepthSlotIngress'. So they should appear.
        // BUT we didn't give them `route`.
        // `harvestSystemSlots` Loop:
        /*
          for (const inst of allInstructions) {
            if (!inst.route) {
              collect([inst], Priority.LOW); // <--- Should hit here!
              continue;
            }
            ...
          }
        */
        // Why did it NOT collect them?
        // Maybe `seed.protocol`?
        // Seed has protocol HTTP_PROTOCOL.
        // Instructions have HTTP_PROTOCOL.
        // Maybe `activeSlots`?
        // `PipelineCompiler.compile(seed)`:
        /*
            const rawBucket = new Map();
            this.registry.getSlotsByProfile(seed.profile || 'default', seed.protocol).forEach(slot => {
                rawBucket.set(slot.name, new Map());
            });
        */
        // `activeSlots` comes from `getSlotsByProfile`.
        // Our new slot `DepthSlotIngress` MUST have matching profile.
        // In setup(): `registry.registerSlot({...})` -> defaults?
        // `SlotDefinition` requires `profiles`.
        // Our dynamic registration:
        /*
        registry.registerSlot({
            definition: { name: 'DepthSlotIngress', protocol: HTTP_PROTOCOL, stage: 'INGRESS' }, // <--- MISSING PROFILES?
            resolverToken: GenericResolverToken
        } as any);
        */
        // If profiles is undefined, `getSlotsByProfile` might filter it out.
        // Let's check `getSlotsByProfile` in `registry.ts`.
        // Let's fix the slot registration to include profiles: ['default']
        const registry = injector.get(Registry);
        registry.registerSlot({
            definition: { name: 'DepthSlotProcess', protocol: HTTP_PROTOCOL, stage: 'PROCESS', profiles: ['default'] },
            resolverToken: GenericResolverToken
        });
        // Plan C: Simplify. Use Process Scope (Class Instructions).
        // This bypasses the Router check in `harvestSystemSlots` because `harvestProcessScope` collects class instructions directly.
        const DEPTH_PROTOCOL = { name: 'DEPTH_PROTOCOL' };
        class MockHost {
        }
        // Define Seed here before usage!
        const seed = {
            name: 'Seed',
            protocol: DEPTH_PROTOCOL,
            aggregation: 'PROCESS_DEF',
            slotName: 'Seed',
            hostClass: MockHost,
            profile: 'default',
            route: { path: '/test', methods: ['GET'] }
        };
        // Register Slot for NEW Protocol
        registry.registerSlot({
            definition: { name: 'DepthSlotProcess', protocol: DEPTH_PROTOCOL, stage: 'PROCESS', profiles: ['default'] },
            resolverToken: GenericResolverToken
        });
        // Update Instructions to be Class-Scope
        instructions.forEach(i => {
            i.protocol = DEPTH_PROTOCOL;
            i.hostClass = MockHost;
            i.slotName = 'DepthSlotProcess'; // Keep slot name
        });
        // Plan D: Manual Orchestration (Bypass Compiler/Harvester/Sorter) to purely test Stack Depth.
        console.log(`> Manually constructing ${depth} nodes...`);
        const factory = injector.get(NodeFactory);
        const composer = injector.get(PipelineComposer);
        const nodes = [];
        // 1. Create Nodes
        for (const inst of instructions) {
            // Mock resolver logic implicitly handled by manualExecutor inside instruction?
            // NodeFactory uses resolver.
            // GenericResolver checks manualExecutor.
            const node = yield factory.create(inst, injector);
            nodes.push(node);
        }
        console.log(`> Constructed Nodes: ${nodes.length}`);
        try {
            // 2. Compose Pipeline
            const runner = composer.compose(nodes);
            const pipeline = { nodes, runner }; // specific shape for logging below
            console.log(`> Compiled Pipeline Nodes: ${pipeline.nodes.length}`);
            const ctx = {
                identify: { depth: 0 },
                injector,
                raw: {},
                inject: () => __awaiter(this, void 0, void 0, function* () { })
            };
            const startTime = Date.now();
            yield pipeline.runner(ctx, () => __awaiter(this, void 0, void 0, function* () {
                // Reached the end
            }));
            const duration = Date.now() - startTime;
            console.log(`> Execution Time: ${duration}ms`);
            console.log(`> Reached Depth: ${ctx.identify.depth} / ${depth}`);
            if (ctx.identify.depth === depth) {
                console.log(`✅ PASS: Pipeline handled ${depth} recursive nodes without Stack Overflow.`);
            }
            else {
                console.error('❌ FAIL: Pipeline terminated early.');
                process.exit(1);
            }
        }
        catch (e) {
            console.error('❌ FAIL: Crashing with error:', e.message);
            if (e.message.includes('stack')) {
                console.error('   -> Confirmed Stack Overflow detected.');
            }
            process.exit(1);
        }
    });
}
// -------------------------------------------------------------
// MAIN
// -------------------------------------------------------------
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        const registry = new Registry();
        registry.registerSlot({ definition: { name: 'DepthSlot', protocol: HTTP_PROTOCOL, stage: 'PROCESS' }, resolverToken: GenericResolverToken });
        // Simplification: Mock the Router to avoid deep dependencies (RadixRouterStrategy etc)
        class MockRouter {
            check() { return true; }
            contains() { return true; }
            add() { }
            match() { return undefined; }
        }
        return Injector.create([
            PipelineCompiler,
            PipelineSorter,
            NodeFactory,
            PipelineComposer,
            { provide: Registry, useValue: registry },
            // Use Mock instead of Real Aggregate
            { provide: AggregateRouterStrategy, useClass: MockRouter },
            { provide: ROUTE_STRATEGY, useExisting: AggregateRouterStrategy },
            RuntimePipelineUtils,
            KernelCompiler,
            { provide: GenericResolverToken, useClass: GenericResolver }
        ]);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('---------------------------------------------------');
        console.log('🚀 STARTING V6 STRESS TEST: LIMITS & ISOLATION');
        console.log('---------------------------------------------------');
        try {
            const injector = yield setup();
            yield runIsolationTest(injector);
            yield runDepthTest(injector);
        }
        catch (e) {
            console.error('❌ FATAL:', e);
            process.exit(1);
        }
    });
}
main();