import { __awaiter } from "tslib";
import 'reflect-metadata';
import { Injector } from '@hwy-fm/di';
import { KernelPolicy } from "./policy/index.js";
import { ROUTE_STRATEGY } from "./routing/strategy.js";
import { AggregateRouterStrategy } from "./routing/aggregate.js";
import { PipelineComposer } from "./compiler/composer.js";
// --- Mocks ---
// Mock Router to control Skip logic
class MockRouter {
    check(route, ctx) {
        // If route has 'skipMe: true', return false (SKIP)
        if (route.skipMe)
            return false;
        return true;
    }
}
// --- Setup ---
function runDebugTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🐞 STARTING DEBUG TRACE TEST 🐞');
        // 1. Enable Debug Mode
        KernelPolicy.enableDebug(true);
        console.log('> KernelPolicy.debugMode set to:', KernelPolicy.debugMode);
        // 2. Setup Injector
        const injector = Injector.create([
            PipelineComposer,
            { provide: AggregateRouterStrategy, useClass: MockRouter },
            { provide: ROUTE_STRATEGY, useExisting: AggregateRouterStrategy },
        ]);
        const composer = injector.get(PipelineComposer);
        // 3. Create Manual Nodes
        const nodes = [
            {
                id: 'Node-1-Auth',
                instruction: { slotName: 'AuthSlot' },
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    console.log('   [Exec] Running Auth...');
                    yield new Promise(r => setTimeout(r, 10)); // Simulate work
                    return next();
                })
            },
            {
                id: 'Node-2-FeatureFlag',
                // This node has a route definition that our MockRouter will reject
                instruction: { slotName: 'FeatureSlot', route: { skipMe: true } },
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    console.log('   [Exec] Running Feature (SHOULD NOT SEE THIS)...');
                    return next();
                })
            },
            {
                id: 'Node-3-Logic',
                instruction: { slotName: 'LogicSlot' },
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    console.log('   [Exec] Running Logic...');
                    yield new Promise(r => setTimeout(r, 25)); // Simulate work
                    return 'LogicResult'; // Return value, don't call next() implies end of chain? Or just return?
                    // Usually middleware calls next(). Let's call next() to be safe or end here.
                    // return next(); 
                })
            }
        ];
        console.log('> Composing Pipeline...');
        const runner = composer.compose(nodes);
        // 4. Run Pipeline
        const ctx = {
            identify: {},
            injector,
            raw: {},
            inject: () => __awaiter(this, void 0, void 0, function* () { })
        };
        console.log('> Executing Runner...');
        yield runner(ctx, () => __awaiter(this, void 0, void 0, function* () {
            console.log('   [Exec] Reached Terminal Next.');
        }));
        // 5. Visualize Trace
        console.log('\n📊 DEBUG TRACE REPORT:');
        if (!ctx._debugTrace) {
            console.error('❌ NO TRACE FOUND! Debug mode failed.');
            return;
        }
        console.table(ctx._debugTrace.map(t => ({
            Type: t.type,
            Node: t.slotName || t.nodeId,
            Reason: t.reason || '-',
            Duration: t.duration ? `${t.duration}ms` : '-'
        })));
        // Verify results
        const hasSkip = ctx._debugTrace.some(t => t.type === 'SKIP' && t.slotName === 'FeatureSlot');
        const hasStart = ctx._debugTrace.some(t => t.type === 'START' && t.slotName === 'AuthSlot');
        if (hasSkip && hasStart) {
            console.log('\n✅ PASS: Debug Trace successfully captured Execution and Skips.');
        }
        else {
            console.error('\n❌ FAIL: Trace missing expected events.');
            process.exit(1);
        }
    });
}
runDebugTest().catch(e => console.error(e));