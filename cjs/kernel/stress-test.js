"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("reflect-metadata");
var di_1 = require("@hwy-fm/di");
var aggregate_1 = require("./routing/aggregate");
var strategy_1 = require("./routing/radix/strategy");
var strategy_2 = require("./routing/strategy");
var pipeline_compiler_1 = require("./compiler/pipeline.compiler");
var sorter_1 = require("./compiler/sorter");
var factory_1 = require("./compiler/factory");
var composer_1 = require("./compiler/composer");
var registry_1 = require("./registry/registry");
// -------------------------------------------------------------
// CONSTANTS & PROTOCOLS
// -------------------------------------------------------------
var HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
var SecurityResolverToken = di_1.InjectorToken.get('SecurityResolver');
var BusinessResolverToken = di_1.InjectorToken.get('BusinessResolver');
var OutputResolverToken = di_1.InjectorToken.get('OutputResolver');
var ProtectionResolverToken = di_1.InjectorToken.get('ProtectionResolver');
var EnrichmentResolverToken = di_1.InjectorToken.get('EnrichmentResolver');
var LoggingResolverToken = di_1.InjectorToken.get('LoggingResolver');
// -------------------------------------------------------------
// TEST COMPONENTS (MOCKS) -> REAL IMPLEMENTATIONS
// -------------------------------------------------------------
var SecurityCheck = /** @class */ (function () {
    function SecurityCheck() {
    }
    SecurityCheck.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Security');
        ctx.identify['trace'] = trace;
        return next();
    };
    SecurityCheck = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], SecurityCheck);
    return SecurityCheck;
}());
var ProtectionCheck = /** @class */ (function () {
    function ProtectionCheck() {
    }
    ProtectionCheck.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Protection');
        ctx.identify['trace'] = trace;
        return next();
    };
    ProtectionCheck = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], ProtectionCheck);
    return ProtectionCheck;
}());
var EnrichmentStep = /** @class */ (function () {
    function EnrichmentStep() {
    }
    EnrichmentStep.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Enrichment');
        ctx.identify['trace'] = trace;
        return next();
    };
    EnrichmentStep = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], EnrichmentStep);
    return EnrichmentStep;
}());
var BodyParser = /** @class */ (function () {
    function BodyParser() {
    }
    BodyParser.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Business');
        ctx.identify['trace'] = trace;
        return next();
    };
    BodyParser = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], BodyParser);
    return BodyParser;
}());
var ResponseSender = /** @class */ (function () {
    function ResponseSender() {
    }
    ResponseSender.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Output');
        ctx.identify['trace'] = trace;
        return next();
    };
    ResponseSender = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], ResponseSender);
    return ResponseSender;
}());
var LoggingStep = /** @class */ (function () {
    function LoggingStep() {
    }
    LoggingStep.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Logging');
        ctx.identify['trace'] = trace;
        return next();
    };
    LoggingStep = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], LoggingStep);
    return LoggingStep;
}());
var MockController = /** @class */ (function () {
    function MockController() {
    }
    MockController = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], MockController);
    return MockController;
}());
var RandomMiddleware = /** @class */ (function () {
    function RandomMiddleware() {
    }
    RandomMiddleware.prototype.execute = function (ctx, next) {
        // The label is handled by the Resolver wrapper for this test
        return next();
    };
    RandomMiddleware = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], RandomMiddleware);
    return RandomMiddleware;
}());
// -------------------------------------------------------------
// GENERIC RESOLVER
// -------------------------------------------------------------
var SimpleResolver = /** @class */ (function () {
    function SimpleResolver(injector) {
        this.injector = injector;
    }
    SimpleResolver.prototype.resolve = function (inst) {
        var _this = this;
        var _a;
        // Resolve the component (middleware) from DI
        // Support stress test: if componentToken is unique (for compiler), use payload for DI
        var token = ((_a = inst.payload) === null || _a === void 0 ? void 0 : _a.realComponentToken) || inst.componentToken;
        var middleware = this.injector.get(token);
        return function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var trace;
            return tslib_1.__generator(this, function (_a) {
                if (inst.payload && inst.payload.label) {
                    if (!ctx.identify)
                        ctx.identify = {};
                    trace = ctx.identify['trace'] || [];
                    trace.push(inst.payload.label);
                    ctx.identify['trace'] = trace;
                }
                return [2 /*return*/, middleware.execute(ctx, next)];
            });
        }); };
    };
    var _a;
    SimpleResolver = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _a : Object])
    ], SimpleResolver);
    return SimpleResolver;
}());
// -------------------------------------------------------------
// MAIN TEST RUNNER
// -------------------------------------------------------------
function runStressTest() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var injector, registry, router, compiler, ROUTES_COUNT, EXECUTION_COUNT, startBuild, routeKeys, i, path, method, randomCount, randomInstructions, expectedForRoute, r, label, seed, compiledPipeline, endBuild, startExec, successCount, failureCount, i, route, context, matchResult, trace, expectedTrace, traceStr, expectedStr, e_1, endExec;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔥 STARTING FULL STACK STRESS TEST (No Mocks) 🔥');
                    injector = di_1.Injector.create([
                        { provide: aggregate_1.AggregateRouterStrategy, useClass: aggregate_1.AggregateRouterStrategy },
                        { provide: strategy_2.ROUTE_STRATEGY, useExisting: aggregate_1.AggregateRouterStrategy },
                        strategy_1.RadixRouterStrategy,
                        pipeline_compiler_1.PipelineCompiler,
                        sorter_1.PipelineSorter,
                        factory_1.NodeFactory,
                        composer_1.PipelineComposer,
                        registry_1.Registry, // Using REAL Registry
                        RandomMiddleware, // Register the class
                        SecurityCheck,
                        ProtectionCheck,
                        EnrichmentStep,
                        BodyParser,
                        ResponseSender,
                        LoggingStep,
                        // Resolvers
                        SimpleResolver,
                        { provide: SecurityResolverToken, useClass: SimpleResolver },
                        { provide: ProtectionResolverToken, useClass: SimpleResolver },
                        { provide: EnrichmentResolverToken, useClass: SimpleResolver },
                        { provide: BusinessResolverToken, useClass: SimpleResolver },
                        { provide: OutputResolverToken, useClass: SimpleResolver },
                        { provide: LoggingResolverToken, useClass: SimpleResolver }
                    ]);
                    registry = injector.get(registry_1.Registry);
                    // --- INGRESS STAGE (Security -> Protection) ---
                    registry.registerSlot({
                        definition: {
                            name: 'SecuritySlot',
                            stage: 'INGRESS',
                            protocol: HTTP_PROTOCOL,
                            profiles: ['default']
                        },
                        resolverToken: SecurityResolverToken
                    });
                    registry.registerInstructions([
                        {
                            slotName: 'SecuritySlot',
                            hostClass: SecurityCheck,
                            componentToken: SecurityCheck,
                            protocol: HTTP_PROTOCOL
                        }
                    ]);
                    registry.registerSlot({
                        definition: {
                            name: 'ProtectionSlot',
                            stage: 'INGRESS',
                            anchors: { after: ['SecuritySlot'] }, // Ensure it runs AFTER Security
                            protocol: HTTP_PROTOCOL,
                            profiles: ['default']
                        },
                        resolverToken: ProtectionResolverToken
                    });
                    registry.registerInstructions([
                        {
                            slotName: 'ProtectionSlot',
                            hostClass: ProtectionCheck, // Typically global
                            componentToken: ProtectionCheck,
                            protocol: HTTP_PROTOCOL
                        }
                    ]);
                    // --- PROCESS STAGE (Enrichment -> Business) ---
                    // Enrichment runs BEFORE BusinessLogic
                    registry.registerSlot({
                        definition: {
                            name: 'EnrichmentSlot',
                            stage: 'PROCESS',
                            anchors: { before: ['BusinessLogic'] },
                            protocol: HTTP_PROTOCOL,
                            profiles: ['default']
                        },
                        resolverToken: EnrichmentResolverToken
                    });
                    // Associate Enrichment with the MockController (simulating an aspect/middleware on the controller)
                    registry.registerInstructions([
                        {
                            slotName: 'EnrichmentSlot',
                            hostClass: MockController,
                            propertyKey: 'handleRequest',
                            componentToken: EnrichmentStep,
                            protocol: HTTP_PROTOCOL
                        }
                    ]);
                    // Main Business Logic
                    registry.registerSlot({
                        definition: {
                            name: 'BusinessLogic',
                            stage: 'PROCESS',
                            protocol: HTTP_PROTOCOL,
                            profiles: ['default']
                        },
                        resolverToken: BusinessResolverToken
                    });
                    registry.registerInstructions([
                        {
                            slotName: 'BusinessLogic',
                            hostClass: MockController,
                            propertyKey: 'handleRequest',
                            componentToken: BodyParser,
                            protocol: HTTP_PROTOCOL
                        }
                    ]);
                    // --- EGRESS STAGE (Output -> Logging) ---
                    registry.registerSlot({
                        definition: {
                            name: 'OutputSlot',
                            stage: 'EGRESS',
                            protocol: HTTP_PROTOCOL,
                            profiles: ['default']
                        },
                        resolverToken: OutputResolverToken
                    });
                    registry.registerInstructions([
                        {
                            slotName: 'OutputSlot',
                            hostClass: ResponseSender,
                            componentToken: ResponseSender,
                            protocol: HTTP_PROTOCOL
                        }
                    ]);
                    registry.registerSlot({
                        definition: {
                            name: 'LoggingSlot',
                            stage: 'EGRESS',
                            anchors: { after: ['OutputSlot'] },
                            protocol: HTTP_PROTOCOL,
                            profiles: ['default']
                        },
                        resolverToken: LoggingResolverToken
                    });
                    registry.registerInstructions([
                        {
                            slotName: 'LoggingSlot',
                            hostClass: LoggingStep,
                            componentToken: LoggingStep,
                            protocol: HTTP_PROTOCOL
                        }
                    ]);
                    router = injector.get(aggregate_1.AggregateRouterStrategy);
                    compiler = injector.get(pipeline_compiler_1.PipelineCompiler);
                    ROUTES_COUNT = 3000;
                    EXECUTION_COUNT = 10000;
                    console.log("Phase 1: Compiling and Adding ".concat(ROUTES_COUNT, " routes with Random Middleware..."));
                    startBuild = process.hrtime();
                    routeKeys = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < ROUTES_COUNT)) return [3 /*break*/, 4];
                    path = "/api/v1/resource_".concat(i);
                    method = i % 2 === 0 ? 'GET' : 'POST';
                    randomCount = Math.floor(Math.random() * 40);
                    randomInstructions = [];
                    expectedForRoute = [];
                    // Base Trace
                    // Security -> Protection
                    expectedForRoute.push('Security');
                    expectedForRoute.push('Protection');
                    // Add Random Ingress Instructions (attached to ProtectionSlot with varying order)
                    for (r = 0; r < randomCount; r++) {
                        label = "Rnd-".concat(i, "-").concat(r);
                        randomInstructions.push({
                            slotName: 'ProtectionSlot', // Same slot, different order
                            hostClass: RandomMiddleware,
                            // Unique token to bypass Compiler deduplication
                            componentToken: "Random-".concat(label),
                            protocol: HTTP_PROTOCOL,
                            route: { path: path, method: method }, // Strict Match for this route
                            order: 10 + r, // Force order after ProtectionCheck (default order 0?)
                            payload: {
                                label: label,
                                realComponentToken: RandomMiddleware
                            }
                        });
                        expectedForRoute.push(label);
                    }
                    // Enrichment -> Business -> Output -> Logging
                    expectedForRoute.push('Enrichment');
                    expectedForRoute.push('Business');
                    expectedForRoute.push('Output');
                    expectedForRoute.push('Logging');
                    // Register these specific instructions
                    if (randomInstructions.length > 0) {
                        registry.registerInstructions(randomInstructions);
                    }
                    seed = {
                        slotName: 'BusinessLogic',
                        hostClass: MockController,
                        propertyKey: 'handleRequest',
                        protocol: HTTP_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        route: { path: path, method: method },
                        strategy: undefined
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 2:
                    compiledPipeline = _a.sent();
                    // Verify Length Limit check (Simulated)
                    if (compiledPipeline.nodes.length > 50) {
                        console.warn("\u26A0\uFE0F Pipeline [".concat(path, "] length ").concat(compiledPipeline.nodes.length, " Exceeds 50!"));
                    }
                    router.add({ path: path, method: method }, compiledPipeline.runner);
                    routeKeys.push({ path: path, method: method, expectedTrace: expectedForRoute });
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    endBuild = process.hrtime(startBuild);
                    console.log("\u2705 Compiled & Added ".concat(ROUTES_COUNT, " routes in ").concat(endBuild[0], "s ").concat(endBuild[1] / 1000000, "ms"));
                    // Execution Phase
                    console.log("Phase 2: Executing ".concat(EXECUTION_COUNT, " Requests..."));
                    startExec = process.hrtime();
                    successCount = 0;
                    failureCount = 0;
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < EXECUTION_COUNT)) return [3 /*break*/, 12];
                    route = routeKeys[Math.floor(Math.random() * ROUTES_COUNT)];
                    context = {
                        path: route.path,
                        method: route.method,
                        identify: {
                            trace: [],
                            method: route.method,
                            path: route.path
                        }
                    };
                    matchResult = router.match(context);
                    if (!(matchResult && matchResult.runner)) return [3 /*break*/, 10];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, matchResult.runner(context, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); })];
                case 7:
                    _a.sent();
                    trace = context.identify['trace'];
                    expectedTrace = route.expectedTrace;
                    traceStr = trace.join(' -> ');
                    expectedStr = expectedTrace.join(' -> ');
                    if (trace.length === expectedTrace.length && traceStr === expectedStr) {
                        successCount++;
                    }
                    else {
                        console.error("\u274C LOGIC FAILURE [".concat(route.path, "]: Got [").concat(traceStr, "] vs Expected [").concat(expectedStr, "]"));
                        failureCount++;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    console.error("\u274C EXECUTION ERROR:", e_1);
                    failureCount++;
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    console.error("\u274C ROUTE MISSING: ".concat(route.path));
                    failureCount++;
                    _a.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 5];
                case 12:
                    endExec = process.hrtime(startExec);
                    console.log("\u2705 Execution Complete.");
                    console.log("   Success: ".concat(successCount));
                    console.log("   Failures: ".concat(failureCount));
                    console.log("   Time: ".concat(endExec[0], "s ").concat(endExec[1] / 1000000, "ms"));
                    console.log("   Throughput: ~".concat(Math.round(EXECUTION_COUNT / (endExec[0] + endExec[1] / 1e9)), " req/s"));
                    return [2 /*return*/];
            }
        });
    });
}
runStressTest().catch(function (err) {
    console.error('FATAL TEST ERROR', err);
});