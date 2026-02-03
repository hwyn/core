var _a;
import { __awaiter, __decorate, __metadata } from "tslib";
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
const HTTP_PROTOCOL = { name: 'HTTP_PROTOCOL' };
const RPC_PROTOCOL = { name: 'RPC_PROTOCOL' };
const JOB_PROTOCOL = { name: 'JOB_PROTOCOL' };
const PROTOCOLS = [HTTP_PROTOCOL, RPC_PROTOCOL, JOB_PROTOCOL];
const PROFILES = ['default', 'strict', 'audit'];
const SecurityResolverToken = InjectorToken.get('SecurityResolver');
const BusinessResolverToken = InjectorToken.get('BusinessResolver');
const OutputResolverToken = InjectorToken.get('OutputResolver');
const ProtectionResolverToken = InjectorToken.get('ProtectionResolver');
const EnrichmentResolverToken = InjectorToken.get('EnrichmentResolver');
const LoggingResolverToken = InjectorToken.get('LoggingResolver');
// New Resolvers for Logic Verification
const JobWorkerResolverToken = InjectorToken.get('JobWorkerResolver');
const RpcHandlerResolverToken = InjectorToken.get('RpcHandlerResolver');
// -------------------------------------------------------------
// TEST COMPONENTS (MOCKS) -> REAL IMPLEMENTATIONS
// -------------------------------------------------------------
let SecurityCheck = class SecurityCheck {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Security');
        ctx.identify['trace'] = trace;
        return next();
    }
};
SecurityCheck = __decorate([
    Injectable()
], SecurityCheck);
let ProtectionCheck = class ProtectionCheck {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Protection');
        ctx.identify['trace'] = trace;
        return next();
    }
};
ProtectionCheck = __decorate([
    Injectable()
], ProtectionCheck);
let EnrichmentStep = class EnrichmentStep {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Enrichment');
        ctx.identify['trace'] = trace;
        return next();
    }
};
EnrichmentStep = __decorate([
    Injectable()
], EnrichmentStep);
let BodyParser = class BodyParser {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Business');
        ctx.identify['trace'] = trace;
        return next();
    }
};
BodyParser = __decorate([
    Injectable()
], BodyParser);
let ResponseSender = class ResponseSender {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Output');
        ctx.identify['trace'] = trace;
        return next();
    }
};
ResponseSender = __decorate([
    Injectable()
], ResponseSender);
let LoggingStep = class LoggingStep {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Logging');
        ctx.identify['trace'] = trace;
        return next();
    }
};
LoggingStep = __decorate([
    Injectable()
], LoggingStep);
let MockController = class MockController {
};
MockController = __decorate([
    Injectable()
], MockController);
let RandomMiddleware = class RandomMiddleware {
    execute(ctx, next) {
        // The label is handled by the Resolver wrapper for this test
        return next();
    }
};
RandomMiddleware = __decorate([
    Injectable()
], RandomMiddleware);
// -------------------------------------------------------------
// GENERIC RESOLVER
// -------------------------------------------------------------
let SimpleResolver = class SimpleResolver {
    constructor(injector) {
        this.injector = injector;
    }
    resolve(inst) {
        var _a;
        // Resolve the component (middleware) from DI
        const token = ((_a = inst.payload) === null || _a === void 0 ? void 0 : _a.realComponentToken) || inst.componentToken;
        const middleware = this.injector.get(token);
        return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (inst.payload && inst.payload.label) {
                if (!ctx.identify)
                    ctx.identify = {};
                const trace = ctx.identify['trace'] || [];
                // ENHANCED VERIFICATION: Capturing Protocol, Slot, and Component
                // Format: [Protocol:Slot:Component]
                const protocolName = inst.protocol.name;
                const entry = `${protocolName}:${inst.slotName}:${inst.payload.label}`;
                trace.push(entry);
                ctx.identify['trace'] = trace;
            }
            return middleware.execute(ctx, next);
        });
    }
};
SimpleResolver = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
], SimpleResolver);
// -------------------------------------------------------------
// MAIN TEST RUNNER
// -------------------------------------------------------------
function runStressTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔥 STARTING FULL STACK STRESS TEST (No Mocks) 🔥');
        // 1. Setup DI
        const injector = Injector.create([
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
        // 2. Setup Registry Data
        const registry = injector.get(Registry);
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
        // 3. Setup Router & Compiler
        const router = injector.get(AggregateRouterStrategy);
        const compiler = injector.get(PipelineCompiler);
        const ROUTES_COUNT = 500; // Smaller count per variation, more variations
        const EXECUTION_COUNT = 5000;
        console.log(`Phase 1: Generating Multi-Protocol/Profile Scenarios...`);
        const startBuild = process.hrtime();
        const routeKeys = [];
        // -------------------------------------------------------------------------
        // A. HTTP TRAFFIC EXTENDED (Profiles: Default, Strict, Audit)
        // -------------------------------------------------------------------------
        for (let i = 0; i < ROUTES_COUNT; i++) {
            const path = `/api/v2/http_${i}`;
            const method = i % 2 === 0 ? 'GET' : 'POST';
            const profile = PROFILES[i % PROFILES.length];
            const expected = [];
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
            const seed = {
                slotName: 'BusinessLogic',
                hostClass: MockController,
                propertyKey: 'handleRequest',
                protocol: HTTP_PROTOCOL,
                aggregation: 'PROCESS_DEF',
                route: { path, method },
                profile: profile
            };
            const compiledPipeline = yield compiler.build(seed, injector);
            router.add({ path, method }, compiledPipeline.runner);
            routeKeys.push({ path, method, profile, protocol: HTTP_PROTOCOL, expectedTrace: expected });
        }
        // -------------------------------------------------------------------------
        // B. RPC TRAFFIC (Simple Chain: Params -> Exec)
        // -------------------------------------------------------------------------
        for (let i = 0; i < ROUTES_COUNT / 2; i++) {
            const path = `rpc.method.${i}`;
            const method = 'RPC';
            const expected = [
                'RPC_PROTOCOL:RpcParams:RpcParse',
                'Business', // RpcParams uses BodyParser -> "Business"
                'RPC_PROTOCOL:RpcExec:RpcExecute',
                'Enrichment' // RpcExec uses EnrichmentStep -> "Enrichment"
            ];
            const seed = {
                slotName: 'RpcExec',
                hostClass: MockController,
                propertyKey: 'rpcCall',
                protocol: RPC_PROTOCOL,
                aggregation: 'PROCESS_DEF',
                route: { path, method }
                // No profile => 'default'
            };
            const compiledPipeline = yield compiler.build(seed, injector);
            router.add({ path, method }, compiledPipeline.runner);
            routeKeys.push({ path, method, profile: 'default', protocol: RPC_PROTOCOL, expectedTrace: expected });
        }
        // -------------------------------------------------------------------------
        // C. JOB TRAFFIC (Batch: Queue -> Process)
        // -------------------------------------------------------------------------
        for (let i = 0; i < ROUTES_COUNT / 2; i++) {
            const path = `job.ticket.${i}`;
            const method = 'JOB';
            const expected = [
                'JOB_PROTOCOL:JobQueue:JobPick',
                'Security', // JobQueue uses SecurityCheck -> "Security"
                'JOB_PROTOCOL:JobProcess:JobRun',
                'Business' // JobProcess uses BodyParser -> "Business"
            ];
            const seed = {
                slotName: 'JobProcess',
                hostClass: MockController,
                propertyKey: 'processJob',
                protocol: JOB_PROTOCOL,
                aggregation: 'PROCESS_DEF',
                route: { path, method }
            };
            const compiledPipeline = yield compiler.build(seed, injector);
            router.add({ path, method }, compiledPipeline.runner);
            routeKeys.push({ path, method, profile: 'default', protocol: JOB_PROTOCOL, expectedTrace: expected });
        }
        const endBuild = process.hrtime(startBuild);
        const totalRoutes = routeKeys.length;
        console.log(`✅ Compiled & Added ${totalRoutes} routes (Mixed Protocols) in ${endBuild[0]}s ${endBuild[1] / 1000000}ms`);
        // Execution Phase
        console.log(`Phase 2: Executing ${EXECUTION_COUNT} Requests (Randomized Mix)...`);
        const startExec = process.hrtime();
        let successCount = 0;
        let failureCount = 0;
        for (let i = 0; i < EXECUTION_COUNT; i++) {
            const route = routeKeys[Math.floor(Math.random() * totalRoutes)];
            const context = {
                path: route.path,
                method: route.method,
                identify: {
                    trace: [],
                    method: route.method,
                    path: route.path
                }
            };
            const matchResult = router.match(context);
            if (matchResult && matchResult.runner) {
                try {
                    yield matchResult.runner(context, () => __awaiter(this, void 0, void 0, function* () { }));
                    const trace = context.identify['trace'];
                    // Expect: Dynamic Trace based on Generation
                    const expectedTrace = route.expectedTrace;
                    const traceStr = trace.join(' -> ');
                    const expectedStr = expectedTrace.join(' -> ');
                    if (trace.length === expectedTrace.length && traceStr === expectedStr) {
                        successCount++;
                    }
                    else {
                        console.error(`❌ LOGIC FAILURE [${route.path}]: Got \n  [${traceStr}] \n  vs Expected \n  [${expectedStr}]`);
                        failureCount++;
                    }
                }
                catch (e) {
                    console.error(`❌ EXECUTION ERROR:`, e);
                    failureCount++;
                }
            }
            else {
                console.error(`❌ ROUTE MISSING: ${route.path}`);
                failureCount++;
            }
        }
        const endExec = process.hrtime(startExec);
        console.log(`✅ Execution Complete.`);
        console.log(`   Success: ${successCount}`);
        console.log(`   Failures: ${failureCount}`);
        console.log(`   Time: ${endExec[0]}s ${endExec[1] / 1000000}ms`); // Corrected ms calculation
        console.log(`   Throughput: ~${Math.round(EXECUTION_COUNT / (endExec[0] + endExec[1] / 1e9))} req/s`);
    });
}
runStressTest().catch((err) => {
    console.error('FATAL TEST ERROR', err);
});