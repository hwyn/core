import { __awaiter } from "tslib";
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
class MockCompiler {
    compilePartial() { return []; }
}
class MockRouter {
    check() { return true; }
    match(ctx) {
        // Use smuggled runner
        const runner = ctx._testRunner;
        if (!runner)
            throw new Error('Test runner not setup');
        return { runner, params: {} };
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
            KernelEventBus, // [NEW] Inject EventBus
            { provide: KernelCompiler, useClass: MockCompiler },
            { provide: RuntimePipelineUtils, useClass: RuntimePipelineUtils },
            { provide: ROUTE_STRATEGY, useClass: MockRouter }
        ]);
    });
}
// ---------------------------------------------------------
// Test Cases
// ---------------------------------------------------------
function testEventFlow(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 1] Event Flow (Start -> End)');
        KernelPolicy.applyConfig({ timeout: 0, concurrency: 0, debug: true }); // Enable debug logging
        const dispatcher = injector.get(KernelDispatcher);
        const bus = injector.get(KernelEventBus);
        const composer = injector.get(PipelineComposer);
        // Track events
        const events = [];
        bus.subscribe('pipe:start', (payload) => {
            events.push('START');
            console.log('   [Event] pipe:start received. Time:', payload.timestamp);
        });
        bus.subscribe('pipe:end', (payload) => {
            events.push('END');
            console.log(`   [Event] pipe:end received. Success: ${payload.success}, Duration: ${payload.duration}ms`);
        });
        // Simple Node
        const nodes = [{
                id: 'simple-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    yield next();
                })
            }];
        const ctx = {
            identify: { method: 'GET', path: '/event-test' },
            injector,
            pipelineState: { plan: [], cursor: 0, isStatic: true },
            // Use compose result directly - it should now be safe to call without next
            _testRunner: composer.compose(nodes)
        };
        yield dispatcher.dispatch(ctx);
        if (events.length === 2 && events[0] === 'START' && events[1] === 'END') {
            console.log('✅ PASSED: Full event lifecycle captured.');
        }
        else {
            console.error('❌ FAILED: Events missing or disordered:', events);
        }
    });
}
function testEventErrorSafety(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 2] Event Handler Safety (Crash Proof)');
        const dispatcher = injector.get(KernelDispatcher);
        const bus = injector.get(KernelEventBus);
        const composer = injector.get(PipelineComposer);
        // Malicious Listener that throws errors
        bus.subscribe('pipe:start', () => {
            console.log('   [Event] Malicious listener throwing error...');
            throw new Error('I AM A BUGGY LISTENER');
        });
        const nodes = [{
                id: 'safe-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    yield next();
                    return 'OK';
                })
            }];
        const ctx = {
            identify: { method: 'GET', path: '/safety-test' },
            injector,
            pipelineState: { plan: [], cursor: 0, isStatic: true },
            _testRunner: composer.compose(nodes)
        };
        try {
            const result = yield dispatcher.dispatch(ctx);
            if (result === 'OK') {
                console.log('✅ PASSED: Main pipeline succeeded despite listener crash.');
            }
        }
        catch (e) {
            console.error('❌ FAILED: Pipeline crashed by listener:', e);
        }
    });
}
function testOverloadEvent(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 3] Overload Event');
        // Force concurrency limit
        KernelPolicy.applyConfig({ timeout: 0, concurrency: 1 });
        const dispatcher = injector.get(KernelDispatcher);
        const bus = injector.get(KernelEventBus);
        let busyEventReceived = false;
        bus.subscribe('sys:busy', (payload) => {
            console.log(`   [Event] sys:busy received. Active: ${payload.active}, Max: ${payload.max}`);
            busyEventReceived = true;
        });
        // Mock Router trick to simulate busy state
        // We manually increment activeRequests by calling dispatch but holding it
        // Wait... we can't easily hold dispatch without complex setup.
        // Let's just launch 2 parallel requests.
        const composer = injector.get(PipelineComposer);
        const nodes = [{
                id: 'block-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise(r => setTimeout(r, 50));
                    yield next();
                })
            }];
        const composed = composer.compose(nodes);
        const runner = (ctx) => __awaiter(this, void 0, void 0, function* () { return composed(ctx, () => __awaiter(this, void 0, void 0, function* () { })); });
        const task1 = dispatcher.dispatch({
            identify: { method: 'GET' }, injector,
            pipelineState: { plan: [], cursor: 0, isStatic: true },
            _testRunner: runner
        });
        try {
            // Immediate second request should fail
            yield dispatcher.dispatch({
                identify: { method: 'GET' }, injector,
                _testRunner: runner
            });
        }
        catch (e) {
            // Expected SERVER_BUSY
        }
        yield task1; // cleanup
        if (busyEventReceived) {
            console.log('✅ PASSED: System Busy event emitted.');
        }
        else {
            console.error('❌ FAILED: Busy event not emitted.');
        }
    });
}
function testDispatchNext(injector) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-------------------------------------------');
        console.log('[Test 4] Dispatch with Custom Next');
        KernelPolicy.applyConfig({ timeout: 0, concurrency: 0, debug: false });
        const dispatcher = injector.get(KernelDispatcher);
        const composer = injector.get(PipelineComposer);
        let nextCalled = false;
        const customNext = () => __awaiter(this, void 0, void 0, function* () {
            nextCalled = true;
            console.log('   [Next] Custom next function called successfully.');
        });
        // Simple Node that just calls next
        const nodes = [{
                id: 'simple-node',
                instruction: {},
                executor: (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    console.log('   [Node] Node executing, calling next...');
                    yield next();
                })
            }];
        const ctx = {
            identify: { method: 'GET', path: '/dispatch-next' },
            injector,
            pipelineState: { plan: [], cursor: 0, isStatic: true },
            _testRunner: composer.compose(nodes)
        };
        // Dispatch with custom next
        // The second argument (strategyToken) is undefined
        yield dispatcher.dispatch(ctx, undefined, customNext);
        if (nextCalled) {
            console.log('✅ PASSED: Custom next function was executed after pipeline.');
        }
        else {
            console.log('❌ FAILED: Custom next function was NOT executed.');
        }
    });
}
// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const injector = yield setup();
            yield testEventFlow(injector);
            yield testEventErrorSafety(injector);
            yield testOverloadEvent(injector);
            yield testDispatchNext(injector);
        }
        catch (e) {
            console.error(e);
        }
    });
}
run();