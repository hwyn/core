var _a, _b;
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
import { ROUTE_STRATEGY } from "./routing/strategy.js";
// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------
const HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
const GenericResolverToken = InjectorToken.get('GenericResolver');
// -------------------------------------------------------------
// RESOLVER
// -------------------------------------------------------------
let GenericResolver = class GenericResolver {
    constructor(injector) {
        this.injector = injector;
    }
    resolve(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            const inst = instruction;
            if (!inst.executor) {
                return (ctx, next) => next();
            }
            // Resolve the executor Class string or Type
            const instance = this.injector.get(inst.executor);
            return (ctx, next) => instance.execute(ctx, next);
        });
    }
};
GenericResolver = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
], GenericResolver);
// -------------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------------
let InitialStep = class InitialStep {
    constructor(injector) {
        this.injector = injector;
    } // To resolve Dynamic steps if needed, but we pass class ref
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureTrace(ctx).push('Initial');
            // Inject Dynamic Steps here
            // We need to construct Instructions manualy since we don't have the decorator metadata handy here easier to mock
            // But wait, inject takes PipelineInstruction objects.
            yield ctx.inject([
                {
                    name: 'DynamicSlot1',
                    executor: DynamicStep1, // Class reference
                    priority: 10,
                    protocol: HTTP_PROTOCOL,
                    aggregation: 'PROCESS',
                    slotName: 'DynamicSlot1' // Irrelevant for injection but required by type?
                },
                {
                    name: 'DynamicSlot2',
                    executor: DynamicStep2,
                    priority: 10,
                    protocol: HTTP_PROTOCOL,
                    aggregation: 'PROCESS',
                    slotName: 'DynamicSlot2'
                }
            ]);
            return next();
        });
    }
};
InitialStep = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_b = typeof Injector !== "undefined" && Injector) === "function" ? _b : Object])
], InitialStep);
let DynamicStep1 = class DynamicStep1 {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureTrace(ctx).push('Dynamic1');
            return next();
        });
    }
};
DynamicStep1 = __decorate([
    Injectable()
], DynamicStep1);
let DynamicStep2 = class DynamicStep2 {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureTrace(ctx).push('Dynamic2');
            return next();
        });
    }
};
DynamicStep2 = __decorate([
    Injectable()
], DynamicStep2);
let FinalStep = class FinalStep {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureTrace(ctx).push('Final');
            return next();
        });
    }
};
FinalStep = __decorate([
    Injectable()
], FinalStep);
let DepA = class DepA {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureTrace(ctx).push('DepA');
            return next();
        });
    }
};
DepA = __decorate([
    Injectable()
], DepA);
let DepB = class DepB {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureTrace(ctx).push('DepB');
            return next();
        });
    }
};
DepB = __decorate([
    Injectable()
], DepB);
let BadProtocolStep = class BadProtocolStep {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () { return next(); });
    }
};
BadProtocolStep = __decorate([
    Injectable()
], BadProtocolStep);
// -------------------------------------------------------------
// HELPER
// -------------------------------------------------------------
function ensureTrace(ctx) {
    if (!ctx.identify)
        ctx.identify = {};
    if (!ctx.identify.trace)
        ctx.identify.trace = [];
    return ctx.identify.trace;
}
// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        const registry = new Registry();
        // Register Slots
        ['Start', 'End', 'DynamicSlot1', 'DynamicSlot2', 'DepA', 'DepB'].forEach(name => {
            const stage = (name === 'Start') ? 'INGRESS' : (name === 'End' ? 'EGRESS' : 'PROCESS');
            registry.registerSlot({
                definition: { name, protocol: HTTP_PROTOCOL, stage, profiles: ['default'] },
                resolverToken: GenericResolverToken
            });
        });
        const injector = Injector.create([
            PipelineCompiler,
            PipelineSorter,
            NodeFactory,
            PipelineComposer,
            { provide: Registry, useValue: registry },
            AggregateRouterStrategy,
            { provide: ROUTE_STRATEGY, useExisting: AggregateRouterStrategy },
            RuntimePipelineUtils,
            KernelCompiler,
            { provide: GenericResolverToken, useClass: GenericResolver },
            InitialStep,
            DynamicStep1,
            DynamicStep2,
            FinalStep,
            DepA,
            DepB,
            BadProtocolStep
        ]);
        // Register Static Flow
        registry.registerInstructions([{
                name: 'InitialStep',
                executor: InitialStep,
                priority: 100,
                protocol: HTTP_PROTOCOL,
                aggregation: 'PROCESS',
                slotName: 'Start',
                after: []
            }]);
        registry.registerInstructions([{
                name: 'FinalStep',
                executor: FinalStep,
                priority: 10,
                protocol: HTTP_PROTOCOL,
                aggregation: 'PROCESS',
                slotName: 'End',
                after: ['Start']
            }]);
        return injector;
    });
}
function runSequentialInjectionTest(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Test 1: Sequential Injection');
        const compiler = injector.get(PipelineCompiler);
        const utils = injector.get(RuntimePipelineUtils);
        // Initial -> End
        const seed = {
            name: 'Seed',
            protocol: HTTP_PROTOCOL,
            aggregation: 'PROCESS_DEF',
            priority: 0,
            executor: null,
            slotName: 'Seed'
        };
        const pipeline = yield compiler.build(seed, injector);
        const ctx = {
            identify: {},
            injector,
            raw: {},
            inject: (instrs) => __awaiter(this, void 0, void 0, function* () { return utils.inject(ctx, instrs); })
        };
        yield pipeline.runner(ctx, () => __awaiter(this, void 0, void 0, function* () { }));
        const trace = ctx.identify.trace;
        console.log('Trace:', trace);
        const expected = ['Initial', 'Dynamic1', 'Dynamic2', 'Final'];
        if (JSON.stringify(trace) !== JSON.stringify(expected))
            throw new Error('Sequential Mismatch');
        console.log('✅ PASS\n');
    });
}
function runTopologicalIgnoranceTest(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Test 2: Topological Ignorance in Injection');
        const compiler = injector.get(PipelineCompiler);
        const utils = injector.get(RuntimePipelineUtils);
        const seed = { name: 'Seed', protocol: HTTP_PROTOCOL, aggregation: 'PROCESS_DEF', slotName: 'Seed' };
        const pipeline = yield compiler.build(seed, injector);
        const ctx = {
            identify: {},
            injector,
            raw: {},
            inject: (instrs) => __awaiter(this, void 0, void 0, function* () { return utils.inject(ctx, instrs); })
        };
        // Override InitialStep to inject DepA and DepB in WRONG order
        // We already have InitialStep registered which calls inject([Dynamic1, Dynamic2]).
        // We can't easily change InitialStep behavior without recompiling/mocking.
        // BUT we can use raw execution or a different seed?
        // Hack: Manually clear trace and run a custom injection via a helper function?
        // No, we must go through pipeline. 
        // Let's assume InitialStep is generic? No it calls specific classes.
        // Workaround: We define a NEW Pipeline for this test?
        // The previous setup() registers InitialStep.
        // Let's manually invoke inject on a context without running the full pipeline?
        // Valid.
        // Simulate being halted at step 0
        ctx.pipelineState = {
            plan: [], // Empty plan
            cursor: -1,
            isStatic: false
        };
        // We inject [DepA, DepB]. 
        // DepA has after: ['DepB']. 
        // If sorted, should be B -> A.
        // If not sorted, A -> B.
        const instructions = [
            {
                name: 'DepA',
                executor: DepA,
                protocol: HTTP_PROTOCOL,
                slotName: 'DepA',
                after: ['DepB'] // Constraint!
            },
            {
                name: 'DepB',
                executor: DepB,
                protocol: HTTP_PROTOCOL,
                slotName: 'DepB'
            }
        ];
        yield ctx.inject(instructions);
        // Now execute the planned nodes
        const plan = ctx.pipelineState.plan;
        // Execute manually
        for (const node of plan) {
            yield node.executor(ctx, () => __awaiter(this, void 0, void 0, function* () { }));
        }
        const trace = ctx.identify.trace || [];
        console.log('Trace:', trace);
        // We EXPECT [DepA, DepB] because Dynamic Injection ignores Sorter.
        const expected = ['DepA', 'DepB'];
        if (JSON.stringify(trace) === JSON.stringify(expected)) {
            console.log('✅ PASS: Injection ignored topological sort as expected (Manual ordering required).');
        }
        else if (JSON.stringify(trace) === JSON.stringify(['DepB', 'DepA'])) {
            console.log('⚠️ SURPRISE: Injection ACTUALLY sorted the instructions!');
        }
        else {
            throw new Error('Unexpected trace');
        }
        console.log('');
    });
}
function runErrorHandlingTest(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Test 3: Injection Error Handling');
        const utils = injector.get(RuntimePipelineUtils);
        const ctx = {
            identify: {},
            injector,
            raw: {},
            pipelineState: { plan: [], cursor: 0, isStatic: false },
            inject: (instrs) => __awaiter(this, void 0, void 0, function* () { return utils.inject(ctx, instrs); })
        };
        try {
            yield ctx.inject([{
                    name: 'Bad',
                    slotName: 'Start',
                    // Missing Protocol -> Should fail in Factory? 
                    // Factory check: "if (!protocol) throw..."
                    protocol: null
                }]);
            console.error('❌ FAIL: Should have thrown error');
            process.exit(1);
        }
        catch (e) {
            console.log('✅ PASS: Caught expected error:', e.message);
        }
        console.log('');
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('---------------------------------------------------');
        console.log('🚀 STARTING V5 STRESS TEST: DYNAMIC INJECTION');
        console.log('---------------------------------------------------');
        try {
            const injector = yield setup();
            yield runSequentialInjectionTest(injector);
            yield runTopologicalIgnoranceTest(injector);
            yield runErrorHandlingTest(injector);
        }
        catch (e) {
            console.error('❌ FATAL:', e);
            process.exit(1);
        }
    });
}
main();