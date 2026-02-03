import { __awaiter, __generator } from "tslib";
import 'reflect-metadata';
import { Injector } from '@hwy-fm/di';
import { KernelDispatcher } from "./runtime/dispatcher.js";
import { PipelineComposer } from "./compiler/composer.js";
import { RuntimePipelineUtils } from "./runtime/pipeline.utils.js";
import { KernelCompiler } from "./compiler/compiler.js";
import { KernelPolicy } from "./policy/index.js";
import { ROUTE_STRATEGY } from "./routing/strategy.js";
import { KernelEventBus } from "./event/bus.js";
// ---------------------------------------------------------
// Mocks
// ---------------------------------------------------------
var MockCompiler = /** @class */ (function () {
    function MockCompiler() {
    }
    MockCompiler.prototype.compilePartial = function () { return []; };
    return MockCompiler;
}());
var MockRouter = /** @class */ (function () {
    function MockRouter() {
    }
    MockRouter.prototype.check = function () { return true; };
    MockRouter.prototype.match = function (ctx) {
        // Use smuggled runner
        var runner = ctx._testRunner;
        if (!runner)
            throw new Error('Test runner not setup');
        return { runner: runner, params: {} };
    };
    return MockRouter;
}());
// ---------------------------------------------------------
// Setup
// ---------------------------------------------------------
function setup() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Injector.create([
                    KernelDispatcher,
                    PipelineComposer,
                    KernelEventBus, // [NEW] Inject EventBus
                    { provide: KernelCompiler, useClass: MockCompiler },
                    { provide: RuntimePipelineUtils, useClass: RuntimePipelineUtils },
                    { provide: ROUTE_STRATEGY, useClass: MockRouter }
                ])];
        });
    });
}
// ---------------------------------------------------------
// Test Cases
// ---------------------------------------------------------
function testEventFlow(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, bus, composer, events, nodes, ctx;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 1] Event Flow (Start -> End)');
                    KernelPolicy.applyConfig({ timeout: 0, concurrency: 0, debug: true }); // Enable debug logging
                    dispatcher = injector.get(KernelDispatcher);
                    bus = injector.get(KernelEventBus);
                    composer = injector.get(PipelineComposer);
                    events = [];
                    bus.subscribe('pipe:start', function (payload) {
                        events.push('START');
                        console.log('   [Event] pipe:start received. Time:', payload.timestamp);
                    });
                    bus.subscribe('pipe:end', function (payload) {
                        events.push('END');
                        console.log("   [Event] pipe:end received. Success: ".concat(payload.success, ", Duration: ").concat(payload.duration, "ms"));
                    });
                    nodes = [{
                            id: 'simple-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, next()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        }];
                    ctx = {
                        identify: { method: 'GET', path: '/event-test' },
                        injector: injector,
                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                        // Use compose result directly - it should now be safe to call without next
                        _testRunner: composer.compose(nodes)
                    };
                    return [4 /*yield*/, dispatcher.dispatch(ctx)];
                case 1:
                    _a.sent();
                    if (events.length === 2 && events[0] === 'START' && events[1] === 'END') {
                        console.log('✅ PASSED: Full event lifecycle captured.');
                    }
                    else {
                        console.error('❌ FAILED: Events missing or disordered:', events);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function testEventErrorSafety(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, bus, composer, nodes, ctx, result, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 2] Event Handler Safety (Crash Proof)');
                    dispatcher = injector.get(KernelDispatcher);
                    bus = injector.get(KernelEventBus);
                    composer = injector.get(PipelineComposer);
                    // Malicious Listener that throws errors
                    bus.subscribe('pipe:start', function () {
                        console.log('   [Event] Malicious listener throwing error...');
                        throw new Error('I AM A BUGGY LISTENER');
                    });
                    nodes = [{
                            id: 'safe-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, next()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, 'OK'];
                                    }
                                });
                            }); }
                        }];
                    ctx = {
                        identify: { method: 'GET', path: '/safety-test' },
                        injector: injector,
                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                        _testRunner: composer.compose(nodes)
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dispatcher.dispatch(ctx)];
                case 2:
                    result = _a.sent();
                    if (result === 'OK') {
                        console.log('✅ PASSED: Main pipeline succeeded despite listener crash.');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error('❌ FAILED: Pipeline crashed by listener:', e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function testOverloadEvent(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, bus, busyEventReceived, composer, nodes, composed, runner, task1, e_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 3] Overload Event');
                    // Force concurrency limit
                    KernelPolicy.applyConfig({ timeout: 0, concurrency: 1 });
                    dispatcher = injector.get(KernelDispatcher);
                    bus = injector.get(KernelEventBus);
                    busyEventReceived = false;
                    bus.subscribe('sys:busy', function (payload) {
                        console.log("   [Event] sys:busy received. Active: ".concat(payload.active, ", Max: ").concat(payload.max));
                        busyEventReceived = true;
                    });
                    composer = injector.get(PipelineComposer);
                    nodes = [{
                            id: 'block-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 50); })];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, next()];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        }];
                    composed = composer.compose(nodes);
                    runner = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            return [2 /*return*/, composed(ctx, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/];
                                }); }); })];
                        });
                    }); };
                    task1 = dispatcher.dispatch({
                        identify: { method: 'GET' },
                        injector: injector,
                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                        _testRunner: runner
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Immediate second request should fail
                    return [4 /*yield*/, dispatcher.dispatch({
                            identify: { method: 'GET' },
                            injector: injector,
                            _testRunner: runner
                        })];
                case 2:
                    // Immediate second request should fail
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, task1];
                case 5:
                    _a.sent(); // cleanup
                    if (busyEventReceived) {
                        console.log('✅ PASSED: System Busy event emitted.');
                    }
                    else {
                        console.error('❌ FAILED: Busy event not emitted.');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function testDispatchNext(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, composer, nextCalled, customNext, nodes, ctx;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 4] Dispatch with Custom Next');
                    KernelPolicy.applyConfig({ timeout: 0, concurrency: 0, debug: false });
                    dispatcher = injector.get(KernelDispatcher);
                    composer = injector.get(PipelineComposer);
                    nextCalled = false;
                    customNext = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            nextCalled = true;
                            console.log('   [Next] Custom next function called successfully.');
                            return [2 /*return*/];
                        });
                    }); };
                    nodes = [{
                            id: 'simple-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log('   [Node] Node executing, calling next...');
                                            return [4 /*yield*/, next()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        }];
                    ctx = {
                        identify: { method: 'GET', path: '/dispatch-next' },
                        injector: injector,
                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                        _testRunner: composer.compose(nodes)
                    };
                    // Dispatch with custom next
                    // The second argument (strategyToken) is undefined
                    return [4 /*yield*/, dispatcher.dispatch(ctx, undefined, customNext)];
                case 1:
                    // Dispatch with custom next
                    // The second argument (strategyToken) is undefined
                    _a.sent();
                    if (nextCalled) {
                        console.log('✅ PASSED: Custom next function was executed after pipeline.');
                    }
                    else {
                        console.log('❌ FAILED: Custom next function was NOT executed.');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var injector, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, setup()];
                case 1:
                    injector = _a.sent();
                    return [4 /*yield*/, testEventFlow(injector)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testEventErrorSafety(injector)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testOverloadEvent(injector)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testDispatchNext(injector)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _a.sent();
                    console.error(e_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
run();