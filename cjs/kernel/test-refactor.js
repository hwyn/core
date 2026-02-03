"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var aggregate_1 = require("./routing/aggregate");
var strategy_1 = require("./routing/radix/strategy");
var strategy_2 = require("./routing/strategy");
// Simple mock for PipelineRunner
var mockRunner = function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, 'Execution Success'];
    });
}); };
function runTest() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var injector, router, routeDef, context, matchResult, missContext, missResult, checkResult, checkResultNoToken, FakeStrategy;
        return tslib_1.__generator(this, function (_a) {
            console.log('--- Starting Kernel Refactor Test ---');
            injector = di_1.Injector.create([
                strategy_1.RadixRouterStrategy,
                aggregate_1.AggregateRouterStrategy,
                { provide: strategy_2.ROUTE_STRATEGY, useClass: aggregate_1.AggregateRouterStrategy }
            ]);
            router = injector.get(aggregate_1.AggregateRouterStrategy);
            console.log('✅ Router Instantiated');
            // 2. Test Add (Implicit Radix)
            console.log('\n[Test 1] Add Route (Implicit Radix)');
            routeDef = { path: '/api/v1/users', method: 'GET' };
            try {
                router.add(routeDef, mockRunner); // Should use RadixRouterStrategy by default
                console.log('✅ Route added successfully');
            }
            catch (e) {
                console.error('❌ Failed to add route:', e);
            }
            // 3. Test Match (Implicit Radix)
            console.log('\n[Test 2] Match Route (Implicit Radix)');
            context = {
                identify: {
                    path: '/api/v1/users',
                    method: 'GET'
                }
            };
            matchResult = router.match(context);
            if (matchResult && matchResult.runner === mockRunner) {
                console.log('✅ Match Success: Found correct runner');
            }
            else {
                console.error('❌ Match Failed: Expected runner not found', matchResult);
            }
            // 4. Test Match Miss
            console.log('\n[Test 3] Match Miss');
            missContext = {
                identify: {
                    path: '/api/v1/unknown',
                    method: 'GET'
                }
            };
            missResult = router.match(missContext);
            if (!missResult) {
                console.log('✅ Match correctly returned undefined for unknown route');
            }
            else {
                console.error('❌ Match Failed: Should be undefined', missResult);
            }
            // 5. Test Check (Explicit Strategy Token - Radix)
            console.log('\n[Test 4] Check Route (Explicit Token)');
            checkResult = router.check(routeDef, context, strategy_1.RadixRouterStrategy);
            if (checkResult === true) {
                console.log('✅ Check Success with explicit token');
            }
            else {
                console.error('❌ Check Failed');
            }
            // 6. Test Check (Missing Token -> Defaults to Radix)
            console.log('\n[Test 5] Check Route (Missing Token)');
            checkResultNoToken = router.check(routeDef, context);
            if (checkResultNoToken === true) {
                console.log('✅ Check correctly returned true (Defaulted to Radix)');
            }
            else {
                console.error('❌ Check Failed: Should return true', checkResultNoToken);
            }
            // 7. Test Dispatch Error (Invalid Token)
            console.log('\n[Test 6] Invalid Token Dispatch');
            FakeStrategy = /** @class */ (function () {
                function FakeStrategy() {
                }
                return FakeStrategy;
            }());
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
            return [2 /*return*/];
        });
    });
}
runTest().catch(console.error);