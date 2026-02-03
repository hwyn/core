"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelCompiler = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var registry_1 = require("../registry/registry");
var pipeline_compiler_1 = require("./pipeline.compiler");
var KernelCompiler = /** @class */ (function () {
    function KernelCompiler(pipelineCompiler, registry) {
        this.pipelineCompiler = pipelineCompiler;
        this.registry = registry;
    }
    KernelCompiler.prototype.compile = function (hostClass, propertyKey, injector) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var instructions, seed;
            return tslib_1.__generator(this, function (_a) {
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
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var _a, runner, nodes;
            return tslib_1.__generator(this, function (_b) {
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
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            return tslib_1.__generator(this, function (_a) {
                throw new Error('Deprecated: Use compileSeed directly');
            });
        });
    };
    KernelCompiler.prototype.compilePartial = function (instructions, injector) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.pipelineCompiler.compileInstructions(instructions, injector)];
            });
        });
    };
    var _a, _b;
    KernelCompiler = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof pipeline_compiler_1.PipelineCompiler !== "undefined" && pipeline_compiler_1.PipelineCompiler) === "function" ? _a : Object, typeof (_b = typeof registry_1.Registry !== "undefined" && registry_1.Registry) === "function" ? _b : Object])
    ], KernelCompiler);
    return KernelCompiler;
}());
exports.KernelCompiler = KernelCompiler;