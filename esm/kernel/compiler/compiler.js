var _a, _b;
import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { Registry } from "../registry/registry.js";
import { PipelineCompiler } from "./pipeline.compiler.js";
let KernelCompiler = class KernelCompiler {
    constructor(pipelineCompiler, registry) {
        this.pipelineCompiler = pipelineCompiler;
        this.registry = registry;
    }
    compile(hostClass, propertyKey, injector) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = this.registry.getMethodInstructions(hostClass, propertyKey);
            const seed = instructions.find(i => 'aggregation' in i && i.aggregation === 'PROCESS_DEF');
            if (!seed) {
                throw new Error(`[KernelCompiler] No Process Seed found for ${hostClass.name}.${propertyKey}`);
            }
            return this.buildPlan(seed, injector);
        });
    }
    buildPlan(seed, injector) {
        return __awaiter(this, void 0, void 0, function* () {
            const { runner, nodes } = yield this.pipelineCompiler.build(seed, injector);
            return {
                runner: (ctx, next) => runner(ctx, next),
                pipeline: nodes
            };
        });
    }
    compileAll(injector) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Deprecated: Use compileSeed directly');
        });
    }
    compilePartial(instructions, injector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pipelineCompiler.compileInstructions(instructions, injector);
        });
    }
};
KernelCompiler = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PipelineCompiler !== "undefined" && PipelineCompiler) === "function" ? _a : Object, typeof (_b = typeof Registry !== "undefined" && Registry) === "function" ? _b : Object])
], KernelCompiler);
export { KernelCompiler };