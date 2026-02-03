import { __awaiter, __decorate, __generator, __metadata, __values } from "tslib";
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
var HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
// const ROUTE_STRATEGY = InjectorToken.get('ROUTE_STRATEGY');
import { ROUTE_STRATEGY } from "./routing/strategy.js";
var GenericResolverToken = InjectorToken.get('GenericResolver');
var GenericResolver = /** @class */ (function () {
    function GenericResolver(injector) {
        this.injector = injector;
    }
    GenericResolver.prototype.resolve = function (instruction) {
        return __awaiter(this, void 0, void 0, function () {
            var inst;
            return __generator(this, function (_a) {
                inst = instruction;
                if (inst.manualExecutor)
                    return [2 /*return*/, inst.manualExecutor]; // Direct function support for testing
                return [2 /*return*/, function (ctx, next) { return next(); }];
            });
        });
    };
    var _a;
    GenericResolver = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
    ], GenericResolver);
    return GenericResolver;
}());
// -------------------------------------------------------------
// TEST A: DATA ISOLATION (Context Bleed)
// -------------------------------------------------------------
function runIsolationTest(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var utils, concurrency, errors, verifyLogic, pipelineRunner, tasks, i, ctx;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Test 1: High-Concurrency Data Isolation (Bleed Check)');
                    utils = injector.get(RuntimePipelineUtils);
                    concurrency = 2000;
                    errors = [];
                    verifyLogic = function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                        var id, error;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    id = ctx.raw.id;
                                    // 1. Write to Context State
                                    ctx.identify.traceId = id;
                                    // 2. Sleep (simulate switching context)
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, Math.random() * 20); })];
                                case 1:
                                    // 2. Sleep (simulate switching context)
                                    _a.sent();
                                    // 3. Verify
                                    if (ctx.identify.traceId !== id) {
                                        error = "Context Bleed! Expected ".concat(id, ", got ").concat(ctx.identify.traceId);
                                        console.error(error);
                                        errors.push(error);
                                    }
                                    return [4 /*yield*/, next()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    pipelineRunner = function (ctx) { return verifyLogic(ctx, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); }); };
                    console.log("> Launching ".concat(concurrency, " parallel requests..."));
                    tasks = [];
                    for (i = 0; i < concurrency; i++) {
                        ctx = {
                            identify: {},
                            injector: injector,
                            raw: { id: "REQ-".concat(i) },
                            inject: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/];
                            }); }); }
                        };
                        tasks.push(pipelineRunner(ctx));
                    }
                    return [4 /*yield*/, Promise.all(tasks)];
                case 1:
                    _a.sent();
                    if (errors.length > 0) {
                        console.error("\u274C FAIL: ".concat(errors.length, " Context Bleed(s) detected!"));
                        process.exit(1);
                    }
                    else {
                        console.log("\u2705 PASS: ".concat(concurrency, " requests handled with Zero context pollution."));
                    }
                    console.log('');
                    return [2 /*return*/];
            }
        });
    });
}
// -------------------------------------------------------------
// TEST B: STACK DEPTH (Recursion Limit)
// -------------------------------------------------------------
function runDepthTest(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var compiler, depth, instructions, i, inst, registry, DEPTH_PROTOCOL, MockHost, seed, factory, composer, nodes, instructions_1, instructions_1_1, inst, node, e_1_1, runner, pipeline, ctx, startTime, duration, e_2;
        var e_1, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Test 2: Pipeline Depth & Stack Integrity');
                    compiler = injector.get(PipelineCompiler);
                    depth = 1000;
                    console.log("> Building pipeline with ".concat(depth, " nodes..."));
                    instructions = [];
                    for (i = 0; i < depth; i++) {
                        inst = {
                            // Uniqueness is key here.
                            name: "Node_".concat(i),
                            // The route definition must match RouteDef interface.
                            // string "/*" is not a RouteDef.
                            route: { path: '/*', methods: ['GET'] },
                            protocol: HTTP_PROTOCOL,
                            slotName: 'DepthSlotIngress', // MUST BE INGRESS or EGRESS for system harvest
                            manualExecutor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Increment counter
                                    ctx.identify.depth = (ctx.identify.depth || 0) + 1;
                                    return [2 /*return*/, next()];
                                });
                            }); }
                        };
                        instructions.push(inst);
                    }
                    registry = injector.get(Registry);
                    registry.registerSlot({
                        definition: { name: 'DepthSlotProcess', protocol: HTTP_PROTOCOL, stage: 'PROCESS', profiles: ['default'] },
                        resolverToken: GenericResolverToken
                    });
                    DEPTH_PROTOCOL = { name: 'DEPTH_PROTOCOL' };
                    MockHost = /** @class */ (function () {
                        function MockHost() {
                        }
                        return MockHost;
                    }());
                    seed = {
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
                    instructions.forEach(function (i) {
                        i.protocol = DEPTH_PROTOCOL;
                        i.hostClass = MockHost;
                        i.slotName = 'DepthSlotProcess'; // Keep slot name
                    });
                    // Plan D: Manual Orchestration (Bypass Compiler/Harvester/Sorter) to purely test Stack Depth.
                    console.log("> Manually constructing ".concat(depth, " nodes..."));
                    factory = injector.get(NodeFactory);
                    composer = injector.get(PipelineComposer);
                    nodes = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    instructions_1 = __values(instructions), instructions_1_1 = instructions_1.next();
                    _b.label = 2;
                case 2:
                    if (!!instructions_1_1.done) return [3 /*break*/, 5];
                    inst = instructions_1_1.value;
                    return [4 /*yield*/, factory.create(inst, injector)];
                case 3:
                    node = _b.sent();
                    nodes.push(node);
                    _b.label = 4;
                case 4:
                    instructions_1_1 = instructions_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (instructions_1_1 && !instructions_1_1.done && (_a = instructions_1.return)) _a.call(instructions_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8:
                    console.log("> Constructed Nodes: ".concat(nodes.length));
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    runner = composer.compose(nodes);
                    pipeline = { nodes: nodes, runner: runner };
                    console.log("> Compiled Pipeline Nodes: ".concat(pipeline.nodes.length));
                    ctx = {
                        identify: { depth: 0 },
                        injector: injector,
                        raw: {},
                        inject: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); }
                    };
                    startTime = Date.now();
                    return [4 /*yield*/, pipeline.runner(ctx, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/];
                            });
                        }); })];
                case 10:
                    _b.sent();
                    duration = Date.now() - startTime;
                    console.log("> Execution Time: ".concat(duration, "ms"));
                    console.log("> Reached Depth: ".concat(ctx.identify.depth, " / ").concat(depth));
                    if (ctx.identify.depth === depth) {
                        console.log("\u2705 PASS: Pipeline handled ".concat(depth, " recursive nodes without Stack Overflow."));
                    }
                    else {
                        console.error('❌ FAIL: Pipeline terminated early.');
                        process.exit(1);
                    }
                    return [3 /*break*/, 12];
                case 11:
                    e_2 = _b.sent();
                    console.error('❌ FAIL: Crashing with error:', e_2.message);
                    if (e_2.message.includes('stack')) {
                        console.error('   -> Confirmed Stack Overflow detected.');
                    }
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// -------------------------------------------------------------
// MAIN
// -------------------------------------------------------------
function setup() {
    return __awaiter(this, void 0, Promise, function () {
        var registry, MockRouter;
        return __generator(this, function (_a) {
            registry = new Registry();
            registry.registerSlot({ definition: { name: 'DepthSlot', protocol: HTTP_PROTOCOL, stage: 'PROCESS' }, resolverToken: GenericResolverToken });
            MockRouter = /** @class */ (function () {
                // Simplification: Mock the Router to avoid deep dependencies (RadixRouterStrategy etc)
                function MockRouter() {
                }
                MockRouter.prototype.check = function () { return true; };
                MockRouter.prototype.contains = function () { return true; };
                MockRouter.prototype.add = function () { };
                MockRouter.prototype.match = function () { return undefined; };
                return MockRouter;
            }());
            return [2 /*return*/, Injector.create([
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
                ])];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var injector, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('---------------------------------------------------');
                    console.log('🚀 STARTING V6 STRESS TEST: LIMITS & ISOLATION');
                    console.log('---------------------------------------------------');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, setup()];
                case 2:
                    injector = _a.sent();
                    return [4 /*yield*/, runIsolationTest(injector)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, runDepthTest(injector)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _a.sent();
                    console.error('❌ FATAL:', e_3);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main();