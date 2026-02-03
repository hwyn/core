"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("reflect-metadata");
var di_1 = require("@hwy-fm/di");
var policy_1 = require("./policy");
var strategy_1 = require("./routing/strategy");
var aggregate_1 = require("./routing/aggregate");
var composer_1 = require("./compiler/composer");
// --- Mocks ---
// Mock Router to control Skip logic
var MockRouter = /** @class */ (function () {
    function MockRouter() {
    }
    MockRouter.prototype.check = function (route, ctx) {
        // If route has 'skipMe: true', return false (SKIP)
        if (route.skipMe)
            return false;
        return true;
    };
    return MockRouter;
}());
// --- Setup ---
function runDebugTest() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var injector, composer, nodes, runner, ctx, hasSkip, hasStart;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🐞 STARTING DEBUG TRACE TEST 🐞');
                    // 1. Enable Debug Mode
                    policy_1.KernelPolicy.enableDebug(true);
                    console.log('> KernelPolicy.debugMode set to:', policy_1.KernelPolicy.debugMode);
                    injector = di_1.Injector.create([
                        composer_1.PipelineComposer,
                        { provide: aggregate_1.AggregateRouterStrategy, useClass: MockRouter },
                        { provide: strategy_1.ROUTE_STRATEGY, useExisting: aggregate_1.AggregateRouterStrategy },
                    ]);
                    composer = injector.get(composer_1.PipelineComposer);
                    nodes = [
                        {
                            id: 'Node-1-Auth',
                            instruction: { slotName: 'AuthSlot' },
                            executor: function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log('   [Exec] Running Auth...');
                                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10); })];
                                        case 1:
                                            _a.sent(); // Simulate work
                                            return [2 /*return*/, next()];
                                    }
                                });
                            }); }
                        },
                        {
                            id: 'Node-2-FeatureFlag',
                            // This node has a route definition that our MockRouter will reject
                            instruction: { slotName: 'FeatureSlot', route: { skipMe: true } },
                            executor: function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    console.log('   [Exec] Running Feature (SHOULD NOT SEE THIS)...');
                                    return [2 /*return*/, next()];
                                });
                            }); }
                        },
                        {
                            id: 'Node-3-Logic',
                            instruction: { slotName: 'LogicSlot' },
                            executor: function (ctx, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log('   [Exec] Running Logic...');
                                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 25); })];
                                        case 1:
                                            _a.sent(); // Simulate work
                                            return [2 /*return*/, 'LogicResult']; // Return value, don't call next() implies end of chain? Or just return?
                                    }
                                });
                            }); }
                        }
                    ];
                    console.log('> Composing Pipeline...');
                    runner = composer.compose(nodes);
                    ctx = {
                        identify: {},
                        injector: injector,
                        raw: {},
                        inject: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); }
                    };
                    console.log('> Executing Runner...');
                    return [4 /*yield*/, runner(ctx, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                console.log('   [Exec] Reached Terminal Next.');
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    _a.sent();
                    // 5. Visualize Trace
                    console.log('\n📊 DEBUG TRACE REPORT:');
                    if (!ctx._debugTrace) {
                        console.error('❌ NO TRACE FOUND! Debug mode failed.');
                        return [2 /*return*/];
                    }
                    console.table(ctx._debugTrace.map(function (t) { return ({
                        Type: t.type,
                        Node: t.slotName || t.nodeId,
                        Reason: t.reason || '-',
                        Duration: t.duration ? "".concat(t.duration, "ms") : '-'
                    }); }));
                    hasSkip = ctx._debugTrace.some(function (t) { return t.type === 'SKIP' && t.slotName === 'FeatureSlot'; });
                    hasStart = ctx._debugTrace.some(function (t) { return t.type === 'START' && t.slotName === 'AuthSlot'; });
                    if (hasSkip && hasStart) {
                        console.log('\n✅ PASS: Debug Trace successfully captured Execution and Skips.');
                    }
                    else {
                        console.error('\n❌ FAIL: Trace missing expected events.');
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
runDebugTest().catch(function (e) { return console.error(e); });