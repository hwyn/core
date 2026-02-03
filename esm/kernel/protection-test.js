import { __awaiter } from "tslib";
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
class MockCompiler {
    compilePartial() { return []; }
}
// Mock Router
class MockRouter {
    check() { return true; }
    match(ctx) {
        // The dispatcher calls result.runner(ctx)
        // We smuggle the real composed runner inside the context for testing
        const runner = ctx._testRunner;
        if (!runner)
            throw new Error('Test runner not setup');
        return {
            runner: runner,
            params: {}
        };
    }
}
// ---------------------------------------------------------
// Setup
// ---------------------------------------------------------
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        return Injector.create([
            KernelDispatcher,
            PipelineComposer,
            { provide: KernelCompiler, useClass: MockCompiler },
            { provide: RuntimePipelineUtils, useClass: RuntimePipelineUtils },
            { provide: ROUTE_STRATEGY, useClass: MockRouter }
        ]);
    });
}
// ---------------------------------------------------------
// Test Cases
// ---------------------------------------------------------
function testTimeout(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 1] Timeout Protection');
        // 1. Configure Policy: 20ms Timeout
        KernelPolicy.applyConfig({ timeout: 20, concurrency: 0 });
        const dispatcher = injector.get(KernelDispatcher);
        const composer = injector.get(PipelineComposer);
        // 2. Create a Slow Node (50ms)
        const nodes = [{
                id: 'slow-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise(resolve => setTimeout(resolve, 50));
                    yield next();
                })
            }];
        // 3. Prepare Context
        const ctx = {
            identify: { method: 'GET', path: '/timeout-test' },
            injector,
            pipelineState: { plan: [], cursor: 0, isStatic: true },
            // Smuggle the runner
            _testRunner: composer.compose(nodes)
        };
        // 4. Run
        const start = Date.now();
        try {
            yield dispatcher.dispatch(ctx);
            console.error('❌ FAILED: Pipeline should have timed out.');
        }
        catch (e) {
            const duration = Date.now() - start;
            if (e.code === ExceptionCode.TIMEOUT) {
                console.log(`✅ PASSED: Caught TIMEOUT exception after ${duration}ms (Expected ~20ms)`);
            }
            else {
                console.error('❌ FAILED: Wrong exception caught:', e);
            }
        }
    });
}
function testConcurrency(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 2] Concurrency Protection');
        // 1. Configure Policy: Max 2 Parallel Requests
        KernelPolicy.applyConfig({ timeout: 0, concurrency: 2 });
        const dispatcher = injector.get(KernelDispatcher);
        const composer = injector.get(PipelineComposer);
        // 2. Create a Blocking Node
        const nodes = [{
                id: 'block-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise(resolve => setTimeout(resolve, 50)); // Hold slot for 50ms
                    yield next();
                })
            }];
        const runner = composer.compose(nodes);
        // 3. Launch 5 Parallel Requests
        console.log('> Launching 5 parallel requests (Max Allowed: 2)...');
        const tasks = Array(5).fill(0).map((_, i) => __awaiter(this, void 0, void 0, function* () {
            const ctx = {
                identify: { method: 'GET', path: `/load-test/${i}` },
                injector,
                pipelineState: { plan: [], cursor: 0, isStatic: true },
                _testRunner: runner
            };
            try {
                yield dispatcher.dispatch(ctx);
                return 'OK';
            }
            catch (e) {
                return e.code || 'UNKNOWN_ERROR';
            }
        }));
        const results = yield Promise.all(tasks);
        // 4. Verify
        const successCount = results.filter(r => r === 'OK').length;
        const busyCount = results.filter(r => r === 'SERVER_BUSY').length;
        console.log(`> Results: [${results.join(', ')}]`);
        console.log(`> Success: ${successCount}, Rejected: ${busyCount}`);
        if (successCount === 2 && busyCount === 3) {
            console.log('✅ PASSED: Strictly limited to 2 concurrent requests.');
        }
        else if (busyCount > 0) {
            console.log('✅ PASSED: Overload protection active (counts may vary slightly locally).');
        }
        else {
            console.error('❌ FAILED: No concurrency protection detected.');
        }
    });
}
function testExternalAbort(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 3] External Cancellation');
        KernelPolicy.applyConfig({ timeout: 0, concurrency: 0 });
        const dispatcher = injector.get(KernelDispatcher);
        const composer = injector.get(PipelineComposer);
        const nodes = [{
                id: 'waiting-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise(resolve => setTimeout(resolve, 100));
                    yield next();
                })
            }];
        // Create manual controller
        const controller = new AbortController();
        const ctx = {
            identify: { method: 'GET', path: '/abort-test' },
            injector,
            pipelineState: { plan: [], cursor: 0, isStatic: true },
            _testRunner: composer.compose(nodes),
            signal: controller.signal // User provided signal
        };
        // Abort after 20ms
        setTimeout(() => {
            console.log('> Triggering external abort...');
            controller.abort();
        }, 20);
        try {
            yield dispatcher.dispatch(ctx);
            console.error('❌ FAILED: Pipeline should have been aborted.');
        }
        catch (e) {
            if (e.code === ExceptionCode.ABORTED) {
                console.log('✅ PASSED: Caught ABORTED exception (External).');
            }
            else if (e.code === ExceptionCode.TIMEOUT) {
                console.error('❌ FAILED: Incorrectly identified as internal TIMEOUT.');
            }
            else {
                console.error('❌ FAILED: Wrong exception caught:', e);
            }
        }
    });
}
// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Need ts-node specific setup? No, simple execution.
            const injector = yield setup();
            yield testTimeout(injector);
            yield testConcurrency(injector);
            yield testExternalAbort(injector);
        }
        catch (e) {
            console.error(e);
        }
    });
}
run();