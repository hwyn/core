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
const SecurityResolverToken = InjectorToken.get('SecurityResolver');
const BusinessResolverToken = InjectorToken.get('BusinessResolver');
const OutputResolverToken = InjectorToken.get('OutputResolver');
const ProtectionResolverToken = InjectorToken.get('ProtectionResolver');
const EnrichmentResolverToken = InjectorToken.get('EnrichmentResolver');
const LoggingResolverToken = InjectorToken.get('LoggingResolver');
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
        // Support stress test: if componentToken is unique (for compiler), use payload for DI
        const token = ((_a = inst.payload) === null || _a === void 0 ? void 0 : _a.realComponentToken) || inst.componentToken;
        const middleware = this.injector.get(token);
        return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (inst.payload && inst.payload.label) {
                if (!ctx.identify)
                    ctx.identify = {};
                const trace = ctx.identify['trace'] || [];
                trace.push(inst.payload.label);
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
            { provide: LoggingResolverToken, useClass: SimpleResolver }
        ]);
        // 2. Setup Registry Data through PUBLIC API
        const registry = injector.get(Registry);
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
        // 3. Setup Router & Compiler
        const router = injector.get(AggregateRouterStrategy);
        const compiler = injector.get(PipelineCompiler);
        const ROUTES_COUNT = 3000;
        const EXECUTION_COUNT = 10000;
        console.log(`Phase 1: Compiling and Adding ${ROUTES_COUNT} routes with Random Middleware...`);
        const startBuild = process.hrtime();
        const routeKeys = [];
        // Pre-calculate random instructions to simulate load
        // Note: In a real app, these would be loaded from config. 
        // Here we register them dynamically.
        for (let i = 0; i < ROUTES_COUNT; i++) {
            const path = `/api/v1/resource_${i}`;
            const method = i % 2 === 0 ? 'GET' : 'POST';
            // 1. Generate Random Middleware for this route
            // "No pipeline slot exceeds 50": We'll add max 40 random items total across slots.
            const randomCount = Math.floor(Math.random() * 40);
            const randomInstructions = [];
            const expectedForRoute = [];
            // Base Trace
            // Security -> Protection
            expectedForRoute.push('Security');
            expectedForRoute.push('Protection');
            // Add Random Ingress Instructions (attached to ProtectionSlot with varying order)
            for (let r = 0; r < randomCount; r++) {
                const label = `Rnd-${i}-${r}`;
                randomInstructions.push({
                    slotName: 'ProtectionSlot', // Same slot, different order
                    hostClass: RandomMiddleware,
                    // Unique token to bypass Compiler deduplication
                    componentToken: `Random-${label}`,
                    protocol: HTTP_PROTOCOL,
                    route: { path, method }, // Strict Match for this route
                    order: 10 + r, // Force order after ProtectionCheck (default order 0?)
                    payload: {
                        label,
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
            // The Seed points to the Controller Method
            const seed = {
                slotName: 'BusinessLogic',
                hostClass: MockController,
                propertyKey: 'handleRequest',
                protocol: HTTP_PROTOCOL,
                aggregation: 'PROCESS_DEF',
                route: { path, method },
                strategy: undefined
            };
            // Compilation triggers...
            const compiledPipeline = yield compiler.build(seed, injector);
            // Verify Length Limit check (Simulated)
            if (compiledPipeline.nodes.length > 50) {
                console.warn(`⚠️ Pipeline [${path}] length ${compiledPipeline.nodes.length} Exceeds 50!`);
            }
            router.add({ path, method }, compiledPipeline.runner);
            routeKeys.push({ path, method, expectedTrace: expectedForRoute });
        }
        const endBuild = process.hrtime(startBuild);
        console.log(`✅ Compiled & Added ${ROUTES_COUNT} routes in ${endBuild[0]}s ${endBuild[1] / 1000000}ms`);
        // Execution Phase
        console.log(`Phase 2: Executing ${EXECUTION_COUNT} Requests...`);
        const startExec = process.hrtime();
        let successCount = 0;
        let failureCount = 0;
        for (let i = 0; i < EXECUTION_COUNT; i++) {
            const route = routeKeys[Math.floor(Math.random() * ROUTES_COUNT)];
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
                        console.error(`❌ LOGIC FAILURE [${route.path}]: Got [${traceStr}] vs Expected [${expectedStr}]`);
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
        console.log(`   Time: ${endExec[0]}s ${endExec[1] / 1000000}ms`);
        console.log(`   Throughput: ~${Math.round(EXECUTION_COUNT / (endExec[0] + endExec[1] / 1e9))} req/s`);
    });
}
runStressTest().catch((err) => {
    console.error('FATAL TEST ERROR', err);
});