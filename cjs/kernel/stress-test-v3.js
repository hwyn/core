"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomDelay = void 0;
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
var RPC_PROTOCOL = { name: 'RPC_PROTOCOL' };
var JOB_PROTOCOL = { name: 'JOB_PROTOCOL' };
var CHAOS_PROTOCOL = { name: 'CHAOS_PROTOCOL' }; // New for V3
var PROTOCOLS = [HTTP_PROTOCOL, RPC_PROTOCOL, JOB_PROTOCOL, CHAOS_PROTOCOL];
var PROFILES = ['default', 'strict', 'audit'];
var SecurityResolverToken = di_1.InjectorToken.get('SecurityResolver');
var BusinessResolverToken = di_1.InjectorToken.get('BusinessResolver');
var OutputResolverToken = di_1.InjectorToken.get('OutputResolver');
var ProtectionResolverToken = di_1.InjectorToken.get('ProtectionResolver');
var EnrichmentResolverToken = di_1.InjectorToken.get('EnrichmentResolver');
var LoggingResolverToken = di_1.InjectorToken.get('LoggingResolver');
var JobWorkerResolverToken = di_1.InjectorToken.get('JobWorkerResolver');
var RpcHandlerResolverToken = di_1.InjectorToken.get('RpcHandlerResolver');
var ChaosResolverToken = di_1.InjectorToken.get('ChaosResolver');
// -------------------------------------------------------------
// TEST COMPONENTS (MOCKS) -> REAL IMPLEMENTATIONS
// -------------------------------------------------------------
// Helper for Async Simulation
var randomDelay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
exports.randomDelay = randomDelay;
var SecurityCheckStep1 = /** @class */ (function () {
    function SecurityCheckStep1() {
    }
    SecurityCheckStep1.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trace;
            return tslib_1.__generator(this, function (_a) {
                if (!ctx.identify)
                    ctx.identify = {};
                trace = ctx.identify['trace'] || [];
                trace.push('Security.Step1'); // Stacked Instruction 1
                return [2 /*return*/, next()];
            });
        });
    };
    SecurityCheckStep1 = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], SecurityCheckStep1);
    return SecurityCheckStep1;
}());
var SecurityCheckStep2 = /** @class */ (function () {
    function SecurityCheckStep2() {
    }
    SecurityCheckStep2.prototype.execute = function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trace;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ctx.identify)
                            ctx.identify = {};
                        trace = ctx.identify['trace'] || [];
                        // Simulate IO latency in Authentication
                        return [4 /*yield*/, (0, exports.randomDelay)(Math.random() * 5)];
                    case 1:
                        // Simulate IO latency in Authentication
                        _a.sent();
                        trace.push('Security.Step2'); // Stacked Instruction 2
                        return [2 /*return*/, next()];
                }
            });
        });
    };
    SecurityCheckStep2 = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], SecurityCheckStep2);
    return SecurityCheckStep2;
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trace;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ctx.identify)
                            ctx.identify = {};
                        trace = ctx.identify['trace'] || [];
                        // Simulate heavy DB lookup
                        return [4 /*yield*/, (0, exports.randomDelay)(2)];
                    case 1:
                        // Simulate heavy DB lookup
                        _a.sent();
                        trace.push('Enrichment');
                        ctx.identify['trace'] = trace;
                        return [2 /*return*/, next()];
                }
            });
        });
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
// CHAOS COMPONENTS
var BlockingMiddleware = /** @class */ (function () {
    function BlockingMiddleware() {
    }
    BlockingMiddleware.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('Blocked!');
        // Intentionally NOT calling next()
        // The chain should stop here.
        return 'ACCESS_DENIED';
    };
    BlockingMiddleware = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], BlockingMiddleware);
    return BlockingMiddleware;
}());
var CrashingMiddleware = /** @class */ (function () {
    function CrashingMiddleware() {
    }
    CrashingMiddleware.prototype.execute = function (ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        var trace = ctx.identify['trace'] || [];
        trace.push('AboutToCrash');
        throw new Error('CRITICAL_FAILURE_SIMULATION');
    };
    CrashingMiddleware = tslib_1.__decorate([
        (0, di_1.Injectable)()
    ], CrashingMiddleware);
    return CrashingMiddleware;
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
        var token = ((_a = inst.payload) === null || _a === void 0 ? void 0 : _a.realComponentToken) || inst.componentToken;
        var middleware = this.injector.get(token);
        return function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var trace, protocolName, entry;
            return tslib_1.__generator(this, function (_a) {
                if (inst.payload && inst.payload.label) {
                    if (!ctx.identify)
                        ctx.identify = {};
                    trace = ctx.identify['trace'] || [];
                    protocolName = inst.protocol.name;
                    entry = "".concat(protocolName, ":").concat(inst.slotName, ":").concat(inst.payload.label);
                    trace.push(entry);
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
        var injector, registry, router, compiler, ROUTES_COUNT, EXECUTION_COUNT, startBuild, routeKeys, i, path, method, profile, expected, seed, compiledPipeline, i, path, method, profile, expected, seed, compiledPipeline, i, path, method, profile, expected, seed, compiledPipeline, endBuild, totalRoutes, startExec, successCount, failureCount, i, route, context, matchResult, trace, traceStr, expectedStr, isExactMatch, e_1, endExec;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔥 STARTING V3 STRESS TEST (Chaos, Async, Stacked) 🔥');
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
                        SecurityCheckStep1,
                        SecurityCheckStep2,
                        ProtectionCheck,
                        EnrichmentStep,
                        BodyParser,
                        ResponseSender,
                        LoggingStep,
                        BlockingMiddleware,
                        CrashingMiddleware,
                        // Resolvers
                        SimpleResolver,
                        { provide: SecurityResolverToken, useClass: SimpleResolver },
                        { provide: ProtectionResolverToken, useClass: SimpleResolver },
                        { provide: EnrichmentResolverToken, useClass: SimpleResolver },
                        { provide: BusinessResolverToken, useClass: SimpleResolver },
                        { provide: OutputResolverToken, useClass: SimpleResolver },
                        { provide: LoggingResolverToken, useClass: SimpleResolver },
                        { provide: JobWorkerResolverToken, useClass: SimpleResolver },
                        { provide: RpcHandlerResolverToken, useClass: SimpleResolver },
                        { provide: ChaosResolverToken, useClass: SimpleResolver }
                    ]);
                    registry = injector.get(registry_1.Registry);
                    // =========================================================================
                    // PROTOCOL 1: HTTP (Complex Topology & Stacked Instructions)
                    // =========================================================================
                    // Security (Stacked: Step1 + Step2)
                    registry.registerSlot({
                        definition: { name: 'SecuritySlot', stage: 'INGRESS', protocol: HTTP_PROTOCOL, profiles: ['default', 'strict', 'audit'] },
                        resolverToken: SecurityResolverToken
                    });
                    // Instruction 1
                    registry.registerInstructions([{
                            slotName: 'SecuritySlot', hostClass: SecurityCheckStep1, componentToken: SecurityCheckStep1, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Security.Step1' }
                        }]);
                    // Instruction 2 (Simulating Multi-Auth in same slot)
                    registry.registerInstructions([{
                            slotName: 'SecuritySlot', hostClass: SecurityCheckStep2, componentToken: SecurityCheckStep2, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Security.Step2' }
                        }]);
                    // Protection (After Security)
                    registry.registerSlot({
                        definition: { name: 'ProtectionSlot', stage: 'INGRESS', anchors: { after: ['SecuritySlot'] }, protocol: HTTP_PROTOCOL, profiles: ['default', 'strict'] },
                        resolverToken: ProtectionResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'ProtectionSlot', hostClass: ProtectionCheck, componentToken: ProtectionCheck, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Protection' }
                        }]);
                    // Audit (Only in 'audit' profile, Before Security?) OR Parallel?
                    // Let's put AuditSlot BEFORE SecuritySlot
                    registry.registerSlot({
                        definition: { name: 'AuditSlot', stage: 'INGRESS', anchors: { before: ['SecuritySlot'] }, protocol: HTTP_PROTOCOL, profiles: ['audit'] },
                        resolverToken: LoggingResolverToken // Reuse Logging Resolver/Component for simplicity
                    });
                    registry.registerInstructions([{
                            slotName: 'AuditSlot', hostClass: LoggingStep, componentToken: LoggingStep, protocol: HTTP_PROTOCOL,
                            payload: { label: 'PreAudit' }
                        }]);
                    // Process & Egress (As before)
                    registry.registerSlot({
                        definition: { name: 'EnrichmentSlot', stage: 'PROCESS', anchors: { before: ['BusinessLogic'] }, protocol: HTTP_PROTOCOL, profiles: ['default', 'strict', 'audit'] },
                        resolverToken: EnrichmentResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'EnrichmentSlot', hostClass: MockController, propertyKey: 'handleRequest', componentToken: EnrichmentStep, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Enrichment' }
                        }]);
                    registry.registerSlot({
                        definition: { name: 'BusinessLogic', stage: 'PROCESS', protocol: HTTP_PROTOCOL, profiles: ['default', 'strict', 'audit'] },
                        resolverToken: BusinessResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'BusinessLogic', hostClass: MockController, propertyKey: 'handleRequest', componentToken: BodyParser, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Business' }
                        }]);
                    registry.registerSlot({
                        definition: { name: 'OutputSlot', stage: 'EGRESS', protocol: HTTP_PROTOCOL, profiles: ['default', 'strict', 'audit'] },
                        resolverToken: OutputResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'OutputSlot', hostClass: ResponseSender, componentToken: ResponseSender, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Output' }
                        }]);
                    // =========================================================================
                    // PROTOCOL 2: RPC (Simple Chain)
                    // =========================================================================
                    registry.registerSlot({
                        definition: { name: 'RpcParams', stage: 'INGRESS', protocol: RPC_PROTOCOL, profiles: ['default'] },
                        resolverToken: RpcHandlerResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'RpcParams', hostClass: MockController, componentToken: BodyParser, protocol: RPC_PROTOCOL,
                            payload: { label: 'RpcParse' }
                        }]);
                    registry.registerSlot({
                        definition: { name: 'RpcExec', stage: 'PROCESS', anchors: { after: ['RpcParams'] }, protocol: RPC_PROTOCOL, profiles: ['default'] },
                        resolverToken: BusinessResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'RpcExec', hostClass: MockController, componentToken: EnrichmentStep, protocol: RPC_PROTOCOL,
                            payload: { label: 'RpcExecute' }
                        }]);
                    // =========================================================================
                    // PROTOCOL 3: JOB (Batch/Background)
                    // =========================================================================
                    registry.registerSlot({
                        definition: { name: 'JobQueue', stage: 'INGRESS', protocol: JOB_PROTOCOL, profiles: ['default'] },
                        resolverToken: JobWorkerResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'JobQueue', hostClass: MockController, componentToken: SecurityCheckStep1, protocol: JOB_PROTOCOL,
                            payload: { label: 'JobPick' }
                        }]);
                    registry.registerSlot({
                        definition: { name: 'JobProcess', stage: 'PROCESS', protocol: JOB_PROTOCOL, profiles: ['default'] },
                        resolverToken: BusinessResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'JobProcess', hostClass: MockController, componentToken: BodyParser, protocol: JOB_PROTOCOL,
                            payload: { label: 'JobRun' }
                        }]);
                    // =========================================================================
                    // PROTOCOL 4: CHAOS (Blocking & Crashing)
                    // =========================================================================
                    // Slot 1: Blocker (Will stop 50% of requests)
                    registry.registerSlot({
                        definition: { name: 'Gatekeeper', stage: 'INGRESS', protocol: CHAOS_PROTOCOL, profiles: ['blocked'] },
                        resolverToken: ChaosResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'Gatekeeper', hostClass: MockController, componentToken: BlockingMiddleware, protocol: CHAOS_PROTOCOL,
                            payload: { label: 'Gate' }
                        }]);
                    // Slot 2: Crasher (Will throw error for 'crashed' profile)
                    registry.registerSlot({
                        definition: { name: 'Minefield', stage: 'PROCESS', protocol: CHAOS_PROTOCOL, profiles: ['crashed'] },
                        resolverToken: ChaosResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'Minefield', hostClass: MockController, componentToken: CrashingMiddleware, protocol: CHAOS_PROTOCOL,
                            payload: { label: 'Boom' }
                        }]);
                    router = injector.get(aggregate_1.AggregateRouterStrategy);
                    compiler = injector.get(pipeline_compiler_1.PipelineCompiler);
                    ROUTES_COUNT = 500;
                    EXECUTION_COUNT = 5000;
                    console.log("Phase 1: Generating Multi-Protocol/Profile Scenarios (V3)...");
                    startBuild = process.hrtime();
                    routeKeys = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < ROUTES_COUNT)) return [3 /*break*/, 4];
                    path = "/api/v3/http_".concat(i);
                    method = i % 2 === 0 ? 'GET' : 'POST';
                    profile = PROFILES[i % PROFILES.length];
                    expected = [];
                    // 1. Audit Slot
                    if (profile === 'audit') {
                        expected.push('HTTP_PROTOCOL:AuditSlot:PreAudit');
                        expected.push('Logging');
                    }
                    // 2. Security Slot (Stacked! Step1 then Step2)
                    // With SimpleResolver, each instruction is resolved independently
                    expected.push('HTTP_PROTOCOL:SecuritySlot:Security.Step1');
                    expected.push('Security.Step1');
                    expected.push('HTTP_PROTOCOL:SecuritySlot:Security.Step2');
                    expected.push('Security.Step2'); // Simulates Async Latency
                    // 4. Protection Slot
                    if (profile !== 'audit') {
                        expected.push('HTTP_PROTOCOL:ProtectionSlot:Protection');
                        expected.push('Protection');
                    }
                    // 5. Enrichment Slot
                    expected.push('HTTP_PROTOCOL:EnrichmentSlot:Enrichment');
                    expected.push('Enrichment'); // Simulates DB Latency
                    // 6. Business Logic
                    expected.push('HTTP_PROTOCOL:BusinessLogic:Business');
                    expected.push('Business');
                    // 7. Output Slot
                    expected.push('HTTP_PROTOCOL:OutputSlot:Output');
                    expected.push('Output');
                    seed = {
                        slotName: 'BusinessLogic',
                        hostClass: MockController,
                        propertyKey: 'handleRequest',
                        protocol: HTTP_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        route: { path: path, method: method },
                        profile: profile
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 2:
                    compiledPipeline = _a.sent();
                    router.add({ path: path, method: method }, compiledPipeline.runner);
                    routeKeys.push({ path: path, method: method, profile: profile, protocol: HTTP_PROTOCOL, expectedTrace: expected });
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < 50)) return [3 /*break*/, 8];
                    path = "/chaos/blocked/".concat(i);
                    method = 'CHAOS';
                    profile = 'blocked';
                    expected = [
                        'CHAOS_PROTOCOL:Gatekeeper:Gate',
                        'Blocked!' // Helper returns "ACCESS_DENIED", chain stops
                    ];
                    seed = {
                        slotName: 'Gatekeeper', // Targeting ingress
                        hostClass: MockController,
                        propertyKey: 'handleRequest',
                        protocol: CHAOS_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        route: { path: path, method: method },
                        profile: profile
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 6:
                    compiledPipeline = _a.sent();
                    router.add({ path: path, method: method }, compiledPipeline.runner);
                    // We expect PARTIAL trace matching. The runner will return "ACCESS_DENIED" 
                    // effectively stopping.
                    routeKeys.push({ path: path, method: method, profile: profile, protocol: CHAOS_PROTOCOL, expectedTrace: expected, expectPartial: true });
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    i = 0;
                    _a.label = 9;
                case 9:
                    if (!(i < 50)) return [3 /*break*/, 12];
                    path = "/chaos/crashed/".concat(i);
                    method = 'CHAOS';
                    profile = 'crashed';
                    expected = [
                        'CHAOS_PROTOCOL:Minefield:Boom',
                        'AboutToCrash'
                    ];
                    seed = {
                        slotName: 'Minefield',
                        hostClass: MockController,
                        propertyKey: 'handleRequest',
                        protocol: CHAOS_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        route: { path: path, method: method },
                        profile: profile
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 10:
                    compiledPipeline = _a.sent();
                    router.add({ path: path, method: method }, compiledPipeline.runner);
                    routeKeys.push({
                        path: path,
                        method: method,
                        profile: profile,
                        protocol: CHAOS_PROTOCOL,
                        expectedTrace: expected,
                        expectError: 'CRITICAL_FAILURE_SIMULATION'
                    });
                    _a.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 9];
                case 12:
                    endBuild = process.hrtime(startBuild);
                    totalRoutes = routeKeys.length;
                    console.log("\u2705 Compiled & Added ".concat(totalRoutes, " routes (Mixed + Chaos) in ").concat(endBuild[0], "s ").concat(endBuild[1] / 1000000, "ms"));
                    // Execution Phase
                    console.log("Phase 2: Executing ".concat(EXECUTION_COUNT, " Requests (Async/Chaos Mix)..."));
                    startExec = process.hrtime();
                    successCount = 0;
                    failureCount = 0;
                    i = 0;
                    _a.label = 13;
                case 13:
                    if (!(i < EXECUTION_COUNT)) return [3 /*break*/, 20];
                    route = routeKeys[Math.floor(Math.random() * totalRoutes)];
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
                    if (!(matchResult && matchResult.runner)) return [3 /*break*/, 18];
                    _a.label = 14;
                case 14:
                    _a.trys.push([14, 16, , 17]);
                    // EXECUTE (Now Async)
                    return [4 /*yield*/, matchResult.runner(context, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); })];
                case 15:
                    // EXECUTE (Now Async)
                    _a.sent();
                    trace = context.identify['trace'];
                    traceStr = trace.join(' -> ');
                    expectedStr = route.expectedTrace.join(' -> ');
                    if (route.expectError) {
                        console.error("\u274C FAILURE [".concat(route.path, "]: Expected Error [").concat(route.expectError, "] but got SUCCESS"));
                        failureCount++;
                    }
                    else {
                        isExactMatch = traceStr === expectedStr;
                        // For blocked, we just check if it contains the trace. 
                        // But our expected array IS the partial trace.
                        // So equality should still hold.
                        if (isExactMatch) {
                            successCount++;
                        }
                        else {
                            console.error("\u274C LOGIC FAILURE [".concat(route.path, "]: \n   Got:      [").concat(traceStr, "] \n   Expected: [").concat(expectedStr, "]"));
                            failureCount++;
                        }
                    }
                    return [3 /*break*/, 17];
                case 16:
                    e_1 = _a.sent();
                    if (route.expectError) {
                        if (e_1.message.includes(route.expectError)) {
                            successCount++;
                        }
                        else {
                            console.error("\u274C WRONG ERROR [".concat(route.path, "]: Got [").concat(e_1.message, "] vs Expected [").concat(route.expectError, "]"));
                            failureCount++;
                        }
                    }
                    else {
                        console.error("\u274C UNEXPECTED ERROR [".concat(route.path, "]:"), e_1);
                        failureCount++;
                    }
                    return [3 /*break*/, 17];
                case 17: return [3 /*break*/, 19];
                case 18:
                    console.error("\u274C ROUTE MISSING: ".concat(route.path));
                    failureCount++;
                    _a.label = 19;
                case 19:
                    i++;
                    return [3 /*break*/, 13];
                case 20:
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