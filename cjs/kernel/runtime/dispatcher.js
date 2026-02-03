"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelDispatcher = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var aggregate_1 = require("../routing/aggregate");
var strategy_1 = require("../routing/strategy");
var exceptions_1 = require("../exceptions");
var pipeline_utils_1 = require("./pipeline.utils");
var policy_1 = require("../policy");
var event_1 = require("../event");
var KernelDispatcher = /** @class */ (function () {
    function KernelDispatcher(router, pipelineUtils, bus) {
        this.router = router;
        this.pipelineUtils = pipelineUtils;
        this.bus = bus;
        this.activeRequests = 0;
        this.shuttingDown = false;
        this.shutdownResolvers = [];
    }
    KernelDispatcher.prototype.shutdown = function () {
        return tslib_1.__awaiter(this, arguments, Promise, function (timeout) {
            var _this = this;
            if (timeout === void 0) { timeout = 30000; }
            return tslib_1.__generator(this, function (_a) {
                if (this.shuttingDown)
                    return [2 /*return*/];
                this.shuttingDown = true;
                if (this.activeRequests === 0)
                    return [2 /*return*/];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timer = setTimeout(function () {
                            reject(new exceptions_1.KernelException(exceptions_1.ExceptionCode.TIMEOUT, 'Shutdown timed out while waiting for requests to drain.'));
                        }, timeout);
                        _this.shutdownResolvers.push(function () {
                            clearTimeout(timer);
                            resolve();
                        });
                    })];
            });
        });
    };
    KernelDispatcher.prototype.dispatch = function (context, strategyToken, next) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var startTime, success, error, runner, result, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkAvailability();
                        this.activeRequests++;
                        startTime = Date.now();
                        this.bus.publish('pipe:start', { context: context, timestamp: startTime });
                        success = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        runner = this.prepareContext(context, strategyToken);
                        return [4 /*yield*/, this.monitorExecution(context, runner, next)];
                    case 2:
                        result = _a.sent();
                        success = true;
                        return [2 /*return*/, result];
                    case 3:
                        err_1 = _a.sent();
                        error = err_1;
                        throw err_1;
                    case 4:
                        this.finalizeRequest(context, startTime, success, error);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    KernelDispatcher.prototype.checkAvailability = function () {
        if (this.shuttingDown) {
            throw new exceptions_1.ServerBusyException('Server is shutting down');
        }
        if (policy_1.KernelPolicy.maxConcurrency > 0 && this.activeRequests >= policy_1.KernelPolicy.maxConcurrency) {
            this.bus.publish('sys:busy', { active: this.activeRequests, max: policy_1.KernelPolicy.maxConcurrency });
            throw new exceptions_1.ServerBusyException();
        }
    };
    KernelDispatcher.prototype.prepareContext = function (context, strategyToken) {
        var _this = this;
        context.inject = function (instructions) { return _this.pipelineUtils.inject(context, instructions); };
        var result = this.router.match(context, strategyToken);
        if (!result) {
            throw new exceptions_1.ResourceNotFoundException('Route', "".concat(context.identify.method, " ").concat(context.identify.path));
        }
        if (result.params) {
            context.identify['params'] = result.params;
        }
        return result.runner;
    };
    KernelDispatcher.prototype.monitorExecution = function (context, runner, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var timeout, controller, timer, err_2, reason;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        timeout = policy_1.KernelPolicy.defaultTimeout;
                        controller = this.ensureSignal(context, timeout);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        if (controller && timeout > 0) {
                            timer = setTimeout(function () { return controller.abort(); }, timeout);
                        }
                        return [4 /*yield*/, runner(context, next)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        err_2 = _b.sent();
                        if (err_2 instanceof exceptions_1.PipelineAbortedException) {
                            reason = ((_a = controller === null || controller === void 0 ? void 0 : controller.signal) === null || _a === void 0 ? void 0 : _a.aborted) ? 'timeout' : 'abort';
                            this.bus.publish('pipe:abort', { reason: reason, context: context });
                            if (reason === 'timeout') {
                                throw new exceptions_1.KernelException(exceptions_1.ExceptionCode.TIMEOUT, 'Pipeline execution timed out.');
                            }
                        }
                        throw err_2;
                    case 4:
                        if (timer)
                            clearTimeout(timer);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    KernelDispatcher.prototype.finalizeRequest = function (context, startTime, success, error) {
        this.activeRequests--;
        this.bus.publish('pipe:end', { context: context, duration: Date.now() - startTime, success: success, error: error });
        if (this.shuttingDown && this.activeRequests === 0) {
            this.shutdownResolvers.forEach(function (r) { return r(); });
            this.shutdownResolvers = [];
        }
    };
    KernelDispatcher.prototype.ensureSignal = function (context, timeout) {
        if (timeout <= 0) {
            return null;
        }
        var controller;
        if (typeof AbortController !== 'undefined') {
            controller = new AbortController();
        }
        else {
            controller = {
                signal: { aborted: false },
                abort: function () { this.signal.aborted = true; }
            };
        }
        if (context.signal) {
            if (context.signal.aborted) {
                controller.abort();
            }
            else {
                // Safe check for addEventListener
                if (typeof context.signal.addEventListener === 'function') {
                    context.signal.addEventListener('abort', function () { return controller.abort(); });
                }
            }
        }
        context.signal = controller.signal;
        return controller;
    };
    var _a, _b, _c;
    KernelDispatcher = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__param(0, (0, di_1.Inject)(strategy_1.ROUTE_STRATEGY)),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof aggregate_1.AggregateRouterStrategy !== "undefined" && aggregate_1.AggregateRouterStrategy) === "function" ? _a : Object, typeof (_b = typeof pipeline_utils_1.RuntimePipelineUtils !== "undefined" && pipeline_utils_1.RuntimePipelineUtils) === "function" ? _b : Object, typeof (_c = typeof event_1.KernelEventBus !== "undefined" && event_1.KernelEventBus) === "function" ? _c : Object])
    ], KernelDispatcher);
    return KernelDispatcher;
}());
exports.KernelDispatcher = KernelDispatcher;