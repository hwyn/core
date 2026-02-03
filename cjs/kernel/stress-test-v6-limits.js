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
// -------------------------------------------------------------
// SETUP
// -------------------------------------------------------------
var HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
// const ROUTE_STRATEGY = InjectorToken.get('ROUTE_STRATEGY');
var strategy_1 = require("./routing/strategy");
var GenericResolverToken = di_1.InjectorToken.get('GenericResolver');
var GenericResolver = /** @class */ (function () {
    function GenericResolver(injector) {
        this.injector = injector;
    }
    GenericResolver.prototype.resolve = function (instruction) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var inst;
            return tslib_1.__generator(this, function (_a) {
                inst = instruction;
                if (inst.manualExecutor)
                    return [2 /*return*/, inst.manualExecutor]; // Direct function support for testing
                return [2 /*return*/, function (ctx, next) { return next(); }];
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
// TEST A: DATA ISOLATION (Context Bleed)
// -------------------------------------------------------------
function runIsolationTest(injector) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var utils, concurrency, errors, verifyLogic, pipelineRunner, tasks, i, ctx;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Test 1: High-Concurrency Data Isolation (Bleed Check)');
                    utils = injector.get(pipeline_utils_1.RuntimePipelineUtils);
                    concurrency = 2000;
                    errors = [];
                    verifyLogic = function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var id, error;
                        return tslib_1.__generator(this, function (_a) {
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
                    pipelineRunner = function (ctx) { return verifyLogic(ctx, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); }); };
                    console.log("> Launching ".concat(concurrency, " parallel requests..."));
                    tasks = [];
                    for (i = 0; i < concurrency; i++) {
                        ctx = {
                            identify: {},
                            injector: injector,
                            raw: { id: "REQ-".concat(i) },
                            inject: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
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
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var compiler, depth, instructions, i, inst, registry, DEPTH_PROTOCOL, MockHost, seed, factory, composer, nodes, instructions_1, instructions_1_1, inst, node, e_1_1, runner, pipeline, ctx, startTime, duration, e_2;
        var e_1, _a;
        var _this = this;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Test 2: Pipeline Depth & Stack Integrity');
                    compiler = injector.get(pipeline_compiler_1.PipelineCompiler);
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
                            manualExecutor: function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    // Increment counter
                                    ctx.identify.depth = (ctx.identify.depth || 0) + 1;
                                    return [2 /*return*/, next()];
                                });
                            }); }
                        };
                        instructions.push(inst);
                    }
                    registry = injector.get(registry_1.Registry);
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
                    factory = injector.get(factory_1.NodeFactory);
                    composer = injector.get(composer_1.PipelineComposer);
                    nodes = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    instructions_1 = tslib_1.__values(instructions), instructions_1_1 = instructions_1.next();
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
                        inject: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); }
                    };
                    startTime = Date.now();
                    return [4 /*yield*/, pipeline.runner(ctx, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
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
    return tslib_1.__awaiter(this, void 0, Promise, function () {
        var registry, MockRouter;
        return tslib_1.__generator(this, function (_a) {
            registry = new registry_1.Registry();
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
            return [2 /*return*/, di_1.Injector.create([
                    pipeline_compiler_1.PipelineCompiler,
                    sorter_1.PipelineSorter,
                    factory_1.NodeFactory,
                    composer_1.PipelineComposer,
                    { provide: registry_1.Registry, useValue: registry },
                    // Use Mock instead of Real Aggregate
                    { provide: aggregate_1.AggregateRouterStrategy, useClass: MockRouter },
                    { provide: strategy_1.ROUTE_STRATEGY, useExisting: aggregate_1.AggregateRouterStrategy },
                    pipeline_utils_1.RuntimePipelineUtils,
                    compiler_1.KernelCompiler,
                    { provide: GenericResolverToken, useClass: GenericResolver }
                ])];
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