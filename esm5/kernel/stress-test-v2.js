import { __awaiter, __decorate, __generator, __metadata } from "tslib";
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
// CONSTANTS & PROTOCOLS
// -------------------------------------------------------------
var HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
var RPC_PROTOCOL = { name: 'RPC_PROTOCOL' };
var JOB_PROTOCOL = { name: 'JOB_PROTOCOL' };
var PROTOCOLS = [HTTP_PROTOCOL, RPC_PROTOCOL, JOB_PROTOCOL];
var PROFILES = ['default', 'strict', 'audit'];
var SecurityResolverToken = InjectorToken.get('SecurityResolver');
var BusinessResolverToken = InjectorToken.get('BusinessResolver');
var OutputResolverToken = InjectorToken.get('OutputResolver');
var ProtectionResolverToken = InjectorToken.get('ProtectionResolver');
var EnrichmentResolverToken = InjectorToken.get('EnrichmentResolver');
var LoggingResolverToken = InjectorToken.get('LoggingResolver');
// New Resolvers for Logic Verification
var JobWorkerResolverToken = InjectorToken.get('JobWorkerResolver');
var RpcHandlerResolverToken = InjectorToken.get('RpcHandlerResolver');
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
    SecurityCheck = __decorate([
        Injectable()
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
    ProtectionCheck = __decorate([
        Injectable()
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
    EnrichmentStep = __decorate([
        Injectable()
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
    BodyParser = __decorate([
        Injectable()
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
    ResponseSender = __decorate([
        Injectable()
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
    LoggingStep = __decorate([
        Injectable()
    ], LoggingStep);
    return LoggingStep;
}());
var MockController = /** @class */ (function () {
    function MockController() {
    }
    MockController = __decorate([
        Injectable()
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
    RandomMiddleware = __decorate([
        Injectable()
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
        return function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var trace, protocolName, entry;
            return __generator(this, function (_a) {
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
    SimpleResolver = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
    ], SimpleResolver);
    return SimpleResolver;
}());
// -------------------------------------------------------------
// MAIN TEST RUNNER
// -------------------------------------------------------------
function runStressTest() {
    return __awaiter(this, void 0, void 0, function () {
        var injector, registry, router, compiler, ROUTES_COUNT, EXECUTION_COUNT, startBuild, routeKeys, i, path, method, profile, expected, seed, compiledPipeline, i, path, method, expected, seed, compiledPipeline, i, path, method, expected, seed, compiledPipeline, endBuild, totalRoutes, startExec, successCount, failureCount, i, route, context, matchResult, trace, expectedTrace, traceStr, expectedStr, e_1, endExec;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔥 STARTING FULL STACK STRESS TEST (No Mocks) 🔥');
                    injector = Injector.create([
                        { provide: AggregateRouterStrategy, useClass: AggregateRouterStrategy },
                        { provide: ROUTE_STRATEGY, useExisting: AggregateRouterStrategy },
                        RadixRouterStrategy,
                        PipelineCompiler,
                        PipelineSorter,
                        NodeFactory,
                        PipelineComposer,
                        Registry, // Using REAL Registry
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
                        { provide: LoggingResolverToken, useClass: SimpleResolver },
                        { provide: JobWorkerResolverToken, useClass: SimpleResolver },
                        { provide: RpcHandlerResolverToken, useClass: SimpleResolver }
                    ]);
                    registry = injector.get(Registry);
                    // =========================================================================
                    // PROTOCOL 1: HTTP (Complex Topology)
                    // =========================================================================
                    // Security (Strict runs deep scan)
                    registry.registerSlot({
                        definition: { name: 'SecuritySlot', stage: 'INGRESS', protocol: HTTP_PROTOCOL, profiles: ['default', 'strict', 'audit'] },
                        resolverToken: SecurityResolverToken
                    });
                    registry.registerInstructions([{
                            slotName: 'SecuritySlot', hostClass: SecurityCheck, componentToken: SecurityCheck, protocol: HTTP_PROTOCOL,
                            payload: { label: 'Security' }
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
                            slotName: 'JobQueue', hostClass: MockController, componentToken: SecurityCheck, protocol: JOB_PROTOCOL,
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
                    router = injector.get(AggregateRouterStrategy);
                    compiler = injector.get(PipelineCompiler);
                    ROUTES_COUNT = 500;
                    EXECUTION_COUNT = 5000;
                    console.log("Phase 1: Generating Multi-Protocol/Profile Scenarios...");
                    startBuild = process.hrtime();
                    routeKeys = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < ROUTES_COUNT)) return [3 /*break*/, 4];
                    path = "/api/v2/http_".concat(i);
                    method = i % 2 === 0 ? 'GET' : 'POST';
                    profile = PROFILES[i % PROFILES.length];
                    expected = [];
                    // 1. Audit Slot (Only in 'audit' profile, before Security)
                    if (profile === 'audit') {
                        expected.push('HTTP_PROTOCOL:AuditSlot:PreAudit');
                        expected.push('Logging'); // Component Log
                    }
                    // 2. Security Slot (All profiles)
                    expected.push('HTTP_PROTOCOL:SecuritySlot:Security');
                    expected.push('Security'); // Component Log
                    // 3. UserActivity (Not implemented in this test setup)
                    // 4. Protection Slot (Excluded in 'audit')
                    if (profile !== 'audit') {
                        expected.push('HTTP_PROTOCOL:ProtectionSlot:Protection');
                        expected.push('Protection'); // Component Log
                    }
                    // 5. Enrichment Slot
                    expected.push('HTTP_PROTOCOL:EnrichmentSlot:Enrichment');
                    expected.push('Enrichment'); // Component Log
                    // 6. Business Logic
                    expected.push('HTTP_PROTOCOL:BusinessLogic:Business');
                    expected.push('Business'); // Component Log (BodyParser used as mock)
                    // 7. Output Slot (All)
                    expected.push('HTTP_PROTOCOL:OutputSlot:Output');
                    expected.push('Output'); // Component Log
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
                    if (!(i < ROUTES_COUNT / 2)) return [3 /*break*/, 8];
                    path = "rpc.method.".concat(i);
                    method = 'RPC';
                    expected = [
                        'RPC_PROTOCOL:RpcParams:RpcParse',
                        'Business', // RpcParams uses BodyParser -> "Business"
                        'RPC_PROTOCOL:RpcExec:RpcExecute',
                        'Enrichment' // RpcExec uses EnrichmentStep -> "Enrichment"
                    ];
                    seed = {
                        slotName: 'RpcExec',
                        hostClass: MockController,
                        propertyKey: 'rpcCall',
                        protocol: RPC_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        route: { path: path, method: method }
                        // No profile => 'default'
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 6:
                    compiledPipeline = _a.sent();
                    router.add({ path: path, method: method }, compiledPipeline.runner);
                    routeKeys.push({ path: path, method: method, profile: 'default', protocol: RPC_PROTOCOL, expectedTrace: expected });
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    i = 0;
                    _a.label = 9;
                case 9:
                    if (!(i < ROUTES_COUNT / 2)) return [3 /*break*/, 12];
                    path = "job.ticket.".concat(i);
                    method = 'JOB';
                    expected = [
                        'JOB_PROTOCOL:JobQueue:JobPick',
                        'Security', // JobQueue uses SecurityCheck -> "Security"
                        'JOB_PROTOCOL:JobProcess:JobRun',
                        'Business' // JobProcess uses BodyParser -> "Business"
                    ];
                    seed = {
                        slotName: 'JobProcess',
                        hostClass: MockController,
                        propertyKey: 'processJob',
                        protocol: JOB_PROTOCOL,
                        aggregation: 'PROCESS_DEF',
                        route: { path: path, method: method }
                    };
                    return [4 /*yield*/, compiler.build(seed, injector)];
                case 10:
                    compiledPipeline = _a.sent();
                    router.add({ path: path, method: method }, compiledPipeline.runner);
                    routeKeys.push({ path: path, method: method, profile: 'default', protocol: JOB_PROTOCOL, expectedTrace: expected });
                    _a.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 9];
                case 12:
                    endBuild = process.hrtime(startBuild);
                    totalRoutes = routeKeys.length;
                    console.log("\u2705 Compiled & Added ".concat(totalRoutes, " routes (Mixed Protocols) in ").concat(endBuild[0], "s ").concat(endBuild[1] / 1000000, "ms"));
                    // Execution Phase
                    console.log("Phase 2: Executing ".concat(EXECUTION_COUNT, " Requests (Randomized Mix)..."));
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
                    return [4 /*yield*/, matchResult.runner(context, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); })];
                case 15:
                    _a.sent();
                    trace = context.identify['trace'];
                    expectedTrace = route.expectedTrace;
                    traceStr = trace.join(' -> ');
                    expectedStr = expectedTrace.join(' -> ');
                    if (trace.length === expectedTrace.length && traceStr === expectedStr) {
                        successCount++;
                    }
                    else {
                        console.error("\u274C LOGIC FAILURE [".concat(route.path, "]: Got \n  [").concat(traceStr, "] \n  vs Expected \n  [").concat(expectedStr, "]"));
                        failureCount++;
                    }
                    return [3 /*break*/, 17];
                case 16:
                    e_1 = _a.sent();
                    console.error("\u274C EXECUTION ERROR:", e_1);
                    failureCount++;
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
                    console.log("   Time: ".concat(endExec[0], "s ").concat(endExec[1] / 1000000, "ms")); // Corrected ms calculation
                    console.log("   Throughput: ~".concat(Math.round(EXECUTION_COUNT / (endExec[0] + endExec[1] / 1e9)), " req/s"));
                    return [2 /*return*/];
            }
        });
    });
}
runStressTest().catch(function (err) {
    console.error('FATAL TEST ERROR', err);
});