import { __awaiter } from "tslib";
import { Injector } from '@hwy-fm/di';
import { AggregateRouterStrategy } from "./routing/aggregate.js";
import { RadixRouterStrategy } from "./routing/radix/strategy.js";
import { ROUTE_STRATEGY } from "./routing/strategy.js";
// Simple mock for PipelineRunner
const mockRunner = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return 'Execution Success';
});
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- Starting Kernel Refactor Test ---');
        // 1. Setup DI
        const injector = Injector.create([
            RadixRouterStrategy,
            AggregateRouterStrategy,
            { provide: ROUTE_STRATEGY, useClass: AggregateRouterStrategy }
        ]);
        const router = injector.get(AggregateRouterStrategy);
        console.log('✅ Router Instantiated');
        // 2. Test Add (Implicit Radix)
        console.log('\n[Test 1] Add Route (Implicit Radix)');
        const routeDef = { path: '/api/v1/users', method: 'GET' };
        try {
            router.add(routeDef, mockRunner); // Should use RadixRouterStrategy by default
            console.log('✅ Route added successfully');
        }
        catch (e) {
            console.error('❌ Failed to add route:', e);
        }
        // 3. Test Match (Implicit Radix)
        console.log('\n[Test 2] Match Route (Implicit Radix)');
        const context = {
            identify: {
                path: '/api/v1/users',
                method: 'GET'
            }
        };
        const matchResult = router.match(context);
        if (matchResult && matchResult.runner === mockRunner) {
            console.log('✅ Match Success: Found correct runner');
        }
        else {
            console.error('❌ Match Failed: Expected runner not found', matchResult);
        }
        // 4. Test Match Miss
        console.log('\n[Test 3] Match Miss');
        const missContext = {
            identify: {
                path: '/api/v1/unknown',
                method: 'GET'
            }
        };
        const missResult = router.match(missContext);
        if (!missResult) {
            console.log('✅ Match correctly returned undefined for unknown route');
        }
        else {
            console.error('❌ Match Failed: Should be undefined', missResult);
        }
        // 5. Test Check (Explicit Strategy Token - Radix)
        console.log('\n[Test 4] Check Route (Explicit Token)');
        const checkResult = router.check(routeDef, context, RadixRouterStrategy);
        if (checkResult === true) {
            console.log('✅ Check Success with explicit token');
        }
        else {
            console.error('❌ Check Failed');
        }
        // 6. Test Check (Missing Token -> Defaults to Radix)
        console.log('\n[Test 5] Check Route (Missing Token)');
        // Since we now default to Radix, this check SHOULD pass
        const checkResultNoToken = router.check(routeDef, context);
        if (checkResultNoToken === true) {
            console.log('✅ Check correctly returned true (Defaulted to Radix)');
        }
        else {
            console.error('❌ Check Failed: Should return true', checkResultNoToken);
        }
        // 7. Test Dispatch Error (Invalid Token)
        console.log('\n[Test 6] Invalid Token Dispatch');
        class FakeStrategy {
        }
        try {
            router.add(routeDef, mockRunner, FakeStrategy);
            console.error('❌ Should have thrown exception for invalid strategy');
        }
        catch (e) {
            if (e.message && e.message.includes('Specified strategy not found')) {
                console.log('✅ Correctly threw exception:', e.message);
            }
            else {
                console.error('❌ Threw unexpected error:', e);
            }
        }
        console.log('\n--- Test Completed ---');
    });
}
runTest().catch(console.error);