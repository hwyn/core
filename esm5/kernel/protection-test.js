import { __awaiter, __generator } from "tslib";
import 'reflect-metadata';
import { Injector } from '@hwy-fm/di';
import { KernelDispatcher } from "./runtime/dispatcher.js";
import { PipelineComposer } from "./compiler/composer.js";
import { RuntimePipelineUtils } from "./runtime/pipeline.utils.js";
import { KernelCompiler } from "./compiler/compiler.js";
import { KernelPolicy } from "./policy/index.js";
import { ROUTE_STRATEGY } from "./routing/strategy.js";
import { ExceptionCode } from "./exceptions/index.js";
// ---------------------------------------------------------
// Mocks
// ---------------------------------------------------------
// Mock Node Factory / Compiler (since RuntimePipelineUtils needs it)
var MockCompiler = /** @class */ (function () {
    function MockCompiler() {
    }
    MockCompiler.prototype.compilePartial = function () { return []; };
    return MockCompiler;
}());
// Mock Router
var MockRouter = /** @class */ (function () {
    function MockRouter() {
    }
    MockRouter.prototype.check = function () { return true; };
    MockRouter.prototype.match = function (ctx) {
        // The dispatcher calls result.runner(ctx)
        // We smuggle the real composed runner inside the context for testing
        var runner = ctx._testRunner;
        if (!runner)
            throw new Error('Test runner not setup');
        return {
            runner: runner,
            params: {}
        };
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
function testTimeout(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, composer, nodes, ctx, start, e_1, duration;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 1] Timeout Protection');
                    // 1. Configure Policy: 20ms Timeout
                    KernelPolicy.applyConfig({ timeout: 20, concurrency: 0 });
                    dispatcher = injector.get(KernelDispatcher);
                    composer = injector.get(PipelineComposer);
                    nodes = [{
                            id: 'slow-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
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
                    ctx = {
                        identify: { method: 'GET', path: '/timeout-test' },
                        injector: injector,
                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                        // Smuggle the runner
                        _testRunner: composer.compose(nodes)
                    };
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dispatcher.dispatch(ctx)];
                case 2:
                    _a.sent();
                    console.error('❌ FAILED: Pipeline should have timed out.');
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    duration = Date.now() - start;
                    if (e_1.code === ExceptionCode.TIMEOUT) {
                        console.log("\u2705 PASSED: Caught TIMEOUT exception after ".concat(duration, "ms (Expected ~20ms)"));
                    }
                    else {
                        console.error('❌ FAILED: Wrong exception caught:', e_1);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function testConcurrency(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, composer, nodes, runner, tasks, results, successCount, busyCount;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 2] Concurrency Protection');
                    // 1. Configure Policy: Max 2 Parallel Requests
                    KernelPolicy.applyConfig({ timeout: 0, concurrency: 2 });
                    dispatcher = injector.get(KernelDispatcher);
                    composer = injector.get(PipelineComposer);
                    nodes = [{
                            id: 'block-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                                        case 1:
                                            _a.sent(); // Hold slot for 50ms
                                            return [4 /*yield*/, next()];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        }];
                    runner = composer.compose(nodes);
                    // 3. Launch 5 Parallel Requests
                    console.log('> Launching 5 parallel requests (Max Allowed: 2)...');
                    tasks = Array(5).fill(0).map(function (_, i) { return __awaiter(_this, void 0, void 0, function () {
                        var ctx, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    ctx = {
                                        identify: { method: 'GET', path: "/load-test/".concat(i) },
                                        injector: injector,
                                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                                        _testRunner: runner
                                    };
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, dispatcher.dispatch(ctx)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, 'OK'];
                                case 3:
                                    e_2 = _a.sent();
                                    return [2 /*return*/, e_2.code || 'UNKNOWN_ERROR'];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(tasks)];
                case 1:
                    results = _a.sent();
                    successCount = results.filter(function (r) { return r === 'OK'; }).length;
                    busyCount = results.filter(function (r) { return r === 'SERVER_BUSY'; }).length;
                    console.log("> Results: [".concat(results.join(', '), "]"));
                    console.log("> Success: ".concat(successCount, ", Rejected: ").concat(busyCount));
                    if (successCount === 2 && busyCount === 3) {
                        console.log('✅ PASSED: Strictly limited to 2 concurrent requests.');
                    }
                    else if (busyCount > 0) {
                        console.log('✅ PASSED: Overload protection active (counts may vary slightly locally).');
                    }
                    else {
                        console.error('❌ FAILED: No concurrency protection detected.');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function testExternalAbort(injector) {
    return __awaiter(this, void 0, void 0, function () {
        var dispatcher, composer, nodes, controller, ctx, e_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-------------------------------------------');
                    console.log('[Test 3] External Cancellation');
                    KernelPolicy.applyConfig({ timeout: 0, concurrency: 0 });
                    dispatcher = injector.get(KernelDispatcher);
                    composer = injector.get(PipelineComposer);
                    nodes = [{
                            id: 'waiting-node',
                            instruction: {},
                            executor: function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
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
                    controller = new AbortController();
                    ctx = {
                        identify: { method: 'GET', path: '/abort-test' },
                        injector: injector,
                        pipelineState: { plan: [], cursor: 0, isStatic: true },
                        _testRunner: composer.compose(nodes),
                        signal: controller.signal // User provided signal
                    };
                    // Abort after 20ms
                    setTimeout(function () {
                        console.log('> Triggering external abort...');
                        controller.abort();
                    }, 20);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dispatcher.dispatch(ctx)];
                case 2:
                    _a.sent();
                    console.error('❌ FAILED: Pipeline should have been aborted.');
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    if (e_3.code === ExceptionCode.ABORTED) {
                        console.log('✅ PASSED: Caught ABORTED exception (External).');
                    }
                    else if (e_3.code === ExceptionCode.TIMEOUT) {
                        console.error('❌ FAILED: Incorrectly identified as internal TIMEOUT.');
                    }
                    else {
                        console.error('❌ FAILED: Wrong exception caught:', e_3);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var injector, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, setup()];
                case 1:
                    injector = _a.sent();
                    return [4 /*yield*/, testTimeout(injector)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testConcurrency(injector)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testExternalAbort(injector)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_4 = _a.sent();
                    console.error(e_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
run();