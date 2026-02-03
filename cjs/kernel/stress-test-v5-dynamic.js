"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("reflect-metadata");
var di_1 = require("@hwy-fm/di");
var aggregate_1 = require("./routing/aggregate");
var pipeline_compiler_1 = require("./compiler/pipeline.compiler");
var sorter_1 = require("./compiler/sorter");
var factory_1 = require("./compiler/factory");
var composer_1 = require("./compiler/composer");
var registry_1 = require("./registry/registry");
var pipeline_utils_1 = require("./runtime/pipeline.utils");
var compiler_1 = require("./compiler/compiler");
var strategy_1 = require("./routing/strategy");
// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------
var HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
var GenericResolverToken = di_1.InjectorToken.get('GenericResolver');
// -------------------------------------------------------------
// RESOLVER
// -------------------------------------------------------------
var GenericResolver = /** @class */ (function () {
    function GenericResolver(injector) {
        this.injector = injector;
    }
    GenericResolver.prototype.resolve = function (instruction) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var inst, instance;
            return tslib_1.__generator(this, function (_a) {
                inst = instruction;
                if (!inst.executor) {
                    return [2 /*return*/, function (ctx, next) { return next(); }];
                }
                instance = this.injector.get(inst.executor);
                return [2 /*return*/, function (ctx, next) { return instance.execute(ctx, next); }];
            });
        });
    };
    var _a;
    GenericResolver = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _a : Object])
    ], GenericResolver);
    return GenericResolver;
}());
// -------------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------------
var InitialStep = /** @class */ (function () {
    function InitialStep(injector) {
        this.injector = injector;
    } // To resolve Dynamic steps if needed, but we pass class ref
    InitialStep.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ensureTrace(ctx).push('Initial');
                        // Inject Dynamic Steps here
                        // We need to construct Instructions manualy since we don't have the decorator metadata handy here easier to mock
                        // But wait, inject takes PipelineInstruction objects.
                        return [4 /*yield*/, ctx.inject([
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
                            ])];
                    case 1:
                        // Inject Dynamic Steps here
                        // We need to construct Instructions manualy since we don't have the decorator metadata handy here easier to mock
                        // But wait, inject takes PipelineInstruction objects.
                        _a.sent();
                        return [2 /*return*/, next()];
                }
            });
        });
    };
    var _b;
    InitialStep = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _b : Object])
    ], InitialStep);
    return InitialStep;
}());
var DynamicStep1 = /** @class */ (function () {
    function DynamicStep1() {
    }
    DynamicStep1.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                ensureTrace(ctx).push('Dynamic1');
                return [2 /*return*/, next()];
            });
        });
    };
    DynamicStep1 = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], DynamicStep1);
    return DynamicStep1;
}());
var DynamicStep2 = /** @class */ (function () {
    function DynamicStep2() {
    }
    DynamicStep2.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                ensureTrace(ctx).push('Dynamic2');
                return [2 /*return*/, next()];
            });
        });
    };
    DynamicStep2 = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], DynamicStep2);
    return DynamicStep2;
}());
var FinalStep = /** @class */ (function () {
    function FinalStep() {
    }
    FinalStep.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                ensureTrace(ctx).push('Final');
                return [2 /*return*/, next()];
            });
        });
    };
    FinalStep = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], FinalStep);
    return FinalStep;
}());
var DepA = /** @class */ (function () {
    function DepA() {
    }
    DepA.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                ensureTrace(ctx).push('DepA');
                return [2 /*return*/, next()];
            });
        });
    };
    DepA = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], DepA);
    return DepA;
}());
var DepB = /** @class */ (function () {
    function DepB() {
    }
    DepB.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                ensureTrace(ctx).push('DepB');
                return [2 /*return*/, next()];
            });
        });
    };
    DepB = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], DepB);
    return DepB;
}());
var BadProtocolStep = /** @class */ (function () {
    function BadProtocolStep() {
    }
    BadProtocolStep.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, next()];
        }); });
    };
    BadProtocolStep = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], BadProtocolStep);
    return BadProtocolStep;
}());
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
    return tslib_1.__awaiter(this, void 0, Promise, function () {
        var registry, injector;
        return tslib_1.__generator(this, function (_a) {
            registry = new registry_1.Registry();
            // Register Slots
            ['Start', 'End', 'DynamicSlot1', 'DynamicSlot2', 'DepA', 'DepB'].forEach(function (name) {
                var stage = (name === 'Start') ? 'INGRESS' : (name === 'End' ? 'EGRESS' : 'PROCESS');
                registry.registerSlot({
                    definition: { name: name, protocol: HTTP_PROTOCOL, stage: stage, profiles: ['default'] },
                    resolverToken: GenericResolverToken
                });
            });
            injector = di_1.Injector.create([
                pipeline_compiler_1.PipelineCompiler,
                sorter_1.PipelineSorter,
                factory_1.NodeFactory,
                composer_1.PipelineComposer,
                { provide: registry_1.Registry, useValue: registry },
                aggregate_1.AggregateRouterStrategy,
                { provide: strategy_1.ROUTE_STRATEGY, useExisting: aggregate_1.AggregateRouterStrategy },
                pipeline_utils_1.RuntimePipelineUtils,
                compiler_1.KernelCompiler,
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
            return [2 /*return*/, injector];
        });
    });
}
function runSequentialInjectionTest(injector) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var compiler, utils, seed, pipeline, ctx, trace, expected;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Test 1: Sequential Injection');
                    compiler = injector.get(pipeline_compiler_1.PipelineCompiler);
                    utils = injector.get(pipeline_utils_1.RuntimePipelineUtils);
                    seed = {
                        name: 'Seed',
                        protocol: HTTP_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        priority: 0,
                        executor: null,
                        slotName: 'Seed'
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 1:
                    pipeline = _a.sent();
                    ctx = {
                        identify: {},
                        injector: injector,
                        raw: {},
                        inject: function (instrs) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/, utils.inject(ctx, instrs)];
                        }); }); }
                    };
                    return [4 /*yield*/, pipeline.runner(ctx, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); })];
                case 2:
                    _a.sent();
                    trace = ctx.identify.trace;
                    console.log('Trace:', trace);
                    expected = ['Initial', 'Dynamic1', 'Dynamic2', 'Final'];
                    if (JSON.stringify(trace) !== JSON.stringify(expected))
                        throw new Error('Sequential Mismatch');
                    console.log('✅ PASS\n');
                    return [2 /*return*/];
            }
        });
    });
}
function runTopologicalIgnoranceTest(injector) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var compiler, utils, seed, pipeline, ctx, instructions, plan, plan_1, plan_1_1, node, e_1_1, trace, expected;
        var e_1, _a;
        var _this = this;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Test 2: Topological Ignorance in Injection');
                    compiler = injector.get(pipeline_compiler_1.PipelineCompiler);
                    utils = injector.get(pipeline_utils_1.RuntimePipelineUtils);
                    seed = { name: 'Seed', protocol: HTTP_PROTOCOL, aggregation: 'PROCESS_DEF', slotName: 'Seed' };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 1:
                    pipeline = _b.sent();
                    ctx = {
                        identify: {},
                        injector: injector,
                        raw: {},
                        inject: function (instrs) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/, utils.inject(ctx, instrs)];
                        }); }); }
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
                    instructions = [
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
                    return [4 /*yield*/, ctx.inject(instructions)];
                case 2:
                    _b.sent();
                    plan = ctx.pipelineState.plan;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 8, 9, 10]);
                    plan_1 = tslib_1.__values(plan), plan_1_1 = plan_1.next();
                    _b.label = 4;
                case 4:
                    if (!!plan_1_1.done) return [3 /*break*/, 7];
                    node = plan_1_1.value;
                    return [4 /*yield*/, node.executor(ctx, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); })];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    plan_1_1 = plan_1.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (plan_1_1 && !plan_1_1.done && (_a = plan_1.return)) _a.call(plan_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 10:
                    trace = ctx.identify.trace || [];
                    console.log('Trace:', trace);
                    expected = ['DepA', 'DepB'];
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
                    return [2 /*return*/];
            }
        });
    });
}
function runErrorHandlingTest(injector) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var utils, ctx, e_2;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Test 3: Injection Error Handling');
                    utils = injector.get(pipeline_utils_1.RuntimePipelineUtils);
                    ctx = {
                        identify: {},
                        injector: injector,
                        raw: {},
                        pipelineState: { plan: [], cursor: 0, isStatic: false },
                        inject: function (instrs) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/, utils.inject(ctx, instrs)];
                        }); }); }
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ctx.inject([{
                                name: 'Bad',
                                slotName: 'Start',
                                // Missing Protocol -> Should fail in Factory? 
                                // Factory check: "if (!protocol) throw..."
                                protocol: null
                            }])];
                case 2:
                    _a.sent();
                    console.error('❌ FAIL: Should have thrown error');
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.log('✅ PASS: Caught expected error:', e_2.message);
                    return [3 /*break*/, 4];
                case 4:
                    console.log('');
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var injector, e_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('---------------------------------------------------');
                    console.log('🚀 STARTING V5 STRESS TEST: DYNAMIC INJECTION');
                    console.log('---------------------------------------------------');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, setup()];
                case 2:
                    injector = _a.sent();
                    return [4 /*yield*/, runSequentialInjectionTest(injector)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, runTopologicalIgnoranceTest(injector)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, runErrorHandlingTest(injector)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _a.sent();
                    console.error('❌ FATAL:', e_3);
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main();