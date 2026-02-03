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
const CHAOS_PROTOCOL = { name: 'CHAOS_PROTOCOL' }; // New for V3
const PROTOCOLS = [HTTP_PROTOCOL, RPC_PROTOCOL, JOB_PROTOCOL, CHAOS_PROTOCOL];
const PROFILES = ['default', 'strict', 'audit'];
const SecurityResolverToken = InjectorToken.get('SecurityResolver');
const BusinessResolverToken = InjectorToken.get('BusinessResolver');
const OutputResolverToken = InjectorToken.get('OutputResolver');
const ProtectionResolverToken = InjectorToken.get('ProtectionResolver');
const EnrichmentResolverToken = InjectorToken.get('EnrichmentResolver');
const LoggingResolverToken = InjectorToken.get('LoggingResolver');
const JobWorkerResolverToken = InjectorToken.get('JobWorkerResolver');
const RpcHandlerResolverToken = InjectorToken.get('RpcHandlerResolver');
const ChaosResolverToken = InjectorToken.get('ChaosResolver');
// -------------------------------------------------------------
// TEST COMPONENTS (MOCKS) -> REAL IMPLEMENTATIONS
// -------------------------------------------------------------
// Helper for Async Simulation
export const randomDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let SecurityCheckStep1 = class SecurityCheckStep1 {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.identify)
                ctx.identify = {};
            const trace = ctx.identify['trace'] || [];
            trace.push('Security.Step1'); // Stacked Instruction 1
            return next();
        });
    }
};
SecurityCheckStep1 = __decorate([
    Injectable()
], SecurityCheckStep1);
let SecurityCheckStep2 = class SecurityCheckStep2 {
    execute(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.identify)
                ctx.identify = {};
            const trace = ctx.identify['trace'] || [];
            // Simulate IO latency in Authentication
            yield randomDelay(Math.random() * 5);
            trace.push('Security.Step2'); // Stacked Instruction 2
            return next();
        });
    }
};
SecurityCheckStep2 = __decorate([
    Injectable()
], SecurityCheckStep2);
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
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.identify)
                ctx.identify = {};
            const trace = ctx.identify['trace'] || [];
            // Simulate heavy DB lookup
            yield randomDelay(2);
            trace.push('Enrichment');
            ctx.identify['trace'] = trace;
            return next();
        });
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
// CHAOS COMPONENTS
let BlockingMiddleware = class BlockingMiddleware {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('Blocked!');
        // Intentionally NOT calling next()
        // The chain should stop here.
        return 'ACCESS_DENIED';
    }
};
BlockingMiddleware = __decorate([
    Injectable()
], BlockingMiddleware);
let CrashingMiddleware = class CrashingMiddleware {
    execute(ctx, next) {
        if (!ctx.identify)
            ctx.identify = {};
        const trace = ctx.identify['trace'] || [];
        trace.push('AboutToCrash');
        throw new Error('CRITICAL_FAILURE_SIMULATION');
    }
};
CrashingMiddleware = __decorate([
    Injectable()
], CrashingMiddleware);
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
        console.log('🔥 STARTING V3 STRESS TEST (Chaos, Async, Stacked) 🔥');
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
        // 2. Setup Registry Data
        const registry = injector.get(Registry);
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
        // 3. Setup Router & Compiler
        const router = injector.get(AggregateRouterStrategy);
        const compiler = injector.get(PipelineCompiler);
        const ROUTES_COUNT = 500;
        const EXECUTION_COUNT = 5000;
        console.log(`Phase 1: Generating Multi-Protocol/Profile Scenarios (V3)...`);
        const startBuild = process.hrtime();
        const routeKeys = [];
        // -------------------------------------------------------------------------
        // A. HTTP TRAFFIC EXTENDED (Stacked Instructions & Latency)
        // -------------------------------------------------------------------------
        for (let i = 0; i < ROUTES_COUNT; i++) {
            const path = `/api/v3/http_${i}`;
            const method = i % 2 === 0 ? 'GET' : 'POST';
            const profile = PROFILES[i % PROFILES.length];
            const expected = [];
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
        // B. CHAOS TRAFFIC (Blocking & Crashing)
        // -------------------------------------------------------------------------
        // Scenario 1: Blocked Request (Gatekeeper says NO)
        for (let i = 0; i < 50; i++) {
            const path = `/chaos/blocked/${i}`;
            const method = 'CHAOS';
            const profile = 'blocked';
            const expected = [
                'CHAOS_PROTOCOL:Gatekeeper:Gate',
                'Blocked!' // Helper returns "ACCESS_DENIED", chain stops
            ];
            const seed = {
                slotName: 'Gatekeeper', // Targeting ingress
                hostClass: MockController,
                propertyKey: 'handleRequest',
                protocol: CHAOS_PROTOCOL,
                aggregation: 'PROCESS_DEF',
                route: { path, method },
                profile
            };
            const compiledPipeline = yield compiler.build(seed, injector);
            router.add({ path, method }, compiledPipeline.runner);
            // We expect PARTIAL trace matching. The runner will return "ACCESS_DENIED" 
            // effectively stopping.
            routeKeys.push({ path, method, profile, protocol: CHAOS_PROTOCOL, expectedTrace: expected, expectPartial: true });
        }
        // Scenario 2: Crashed Request (Minefield explodes)
        for (let i = 0; i < 50; i++) {
            const path = `/chaos/crashed/${i}`;
            const method = 'CHAOS';
            const profile = 'crashed';
            const expected = [
                'CHAOS_PROTOCOL:Minefield:Boom',
                'AboutToCrash'
            ];
            const seed = {
                slotName: 'Minefield',
                hostClass: MockController,
                propertyKey: 'handleRequest',
                protocol: CHAOS_PROTOCOL,
                aggregation: 'PROCESS_DEF',
                route: { path, method },
                profile
            };
            const compiledPipeline = yield compiler.build(seed, injector);
            router.add({ path, method }, compiledPipeline.runner);
            routeKeys.push({
                path, method, profile, protocol: CHAOS_PROTOCOL,
                expectedTrace: expected,
                expectError: 'CRITICAL_FAILURE_SIMULATION'
            });
        }
        const endBuild = process.hrtime(startBuild);
        const totalRoutes = routeKeys.length;
        console.log(`✅ Compiled & Added ${totalRoutes} routes (Mixed + Chaos) in ${endBuild[0]}s ${endBuild[1] / 1000000}ms`);
        // Execution Phase
        console.log(`Phase 2: Executing ${EXECUTION_COUNT} Requests (Async/Chaos Mix)...`);
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
                    // EXECUTE (Now Async)
                    yield matchResult.runner(context, () => __awaiter(this, void 0, void 0, function* () { }));
                    const trace = context.identify['trace'];
                    const traceStr = trace.join(' -> ');
                    const expectedStr = route.expectedTrace.join(' -> ');
                    if (route.expectError) {
                        console.error(`❌ FAILURE [${route.path}]: Expected Error [${route.expectError}] but got SUCCESS`);
                        failureCount++;
                    }
                    else {
                        // Normal or Blocked
                        const isExactMatch = traceStr === expectedStr;
                        // For blocked, we just check if it contains the trace. 
                        // But our expected array IS the partial trace.
                        // So equality should still hold.
                        if (isExactMatch) {
                            successCount++;
                        }
                        else {
                            console.error(`❌ LOGIC FAILURE [${route.path}]: \n   Got:      [${traceStr}] \n   Expected: [${expectedStr}]`);
                            failureCount++;
                        }
                    }
                }
                catch (e) {
                    if (route.expectError) {
                        if (e.message.includes(route.expectError)) {
                            successCount++;
                        }
                        else {
                            console.error(`❌ WRONG ERROR [${route.path}]: Got [${e.message}] vs Expected [${route.expectError}]`);
                            failureCount++;
                        }
                    }
                    else {
                        console.error(`❌ UNEXPECTED ERROR [${route.path}]:`, e);
                        failureCount++;
                    }
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
        console.log(`   Time: ${endExec[0]}s ${endExec[1] / 1000000}ms`);
        console.log(`   Throughput: ~${Math.round(EXECUTION_COUNT / (endExec[0] + endExec[1] / 1e9))} req/s`);
    });
}
runStressTest().catch((err) => {
    console.error('FATAL TEST ERROR', err);
});