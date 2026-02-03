import { __awaiter, __decorate, __generator, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { Registry } from "../registry/registry.js";
import { PipelineCompiler } from "./pipeline.compiler.js";
var KernelCompiler = /** @class */ (function () {
    function KernelCompiler(pipelineCompiler, registry) {
        this.pipelineCompiler = pipelineCompiler;
        this.registry = registry;
    }
    KernelCompiler.prototype.compile = function (hostClass, propertyKey, injector) {
        return __awaiter(this, void 0, Promise, function () {
            var instructions, seed;
            return __generator(this, function (_a) {
                instructions = this.registry.getMethodInstructions(hostClass, propertyKey);
                seed = instructions.find(function (i) { return 'aggregation' in i && i.aggregation === 'PROCESS_DEF'; });
                if (!seed) {
                    throw new Error("[KernelCompiler] No Process Seed found for ".concat(hostClass.name, ".").concat(propertyKey));
                }
                return [2 /*return*/, this.buildPlan(seed, injector)];
            });
        });
    };
    KernelCompiler.prototype.buildPlan = function (seed, injector) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, runner, nodes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.pipelineCompiler.build(seed, injector)];
                    case 1:
                        _a = _b.sent(), runner = _a.runner, nodes = _a.nodes;
                        return [2 /*return*/, {
                                runner: function (ctx, next) { return runner(ctx, next); },
                                pipeline: nodes
                            }];
                }
            });
        });
    };
    KernelCompiler.prototype.compileAll = function (injector) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                throw new Error('Deprecated: Use compileSeed directly');
            });
        });
    };
    KernelCompiler.prototype.compilePartial = function (instructions, injector) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.pipelineCompiler.compileInstructions(instructions, injector)];
            });
        });
    };
    var _a, _b;
    KernelCompiler = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof PipelineCompiler !== "undefined" && PipelineCompiler) === "function" ? _a : Object, typeof (_b = typeof Registry !== "undefined" && Registry) === "function" ? _b : Object])
    ], KernelCompiler);
    return KernelCompiler;
}());
export { KernelCompiler };