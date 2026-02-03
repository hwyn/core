var _a;
import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { KernelCompiler } from "../compiler/compiler.js";
import { KernelPolicy } from "../policy/index.js";
let RuntimePipelineUtils = class RuntimePipelineUtils {
    constructor(compiler) {
        this.compiler = compiler;
    }
    getPlan(context) {
        var _a;
        return ((_a = context.pipelineState) === null || _a === void 0 ? void 0 : _a.plan) || [];
    }
    inject(context, instructions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!context.pipelineState) {
                KernelPolicy.logger.warn('[Runtime] Pipeline state missing during inject. Ignoring.');
                return;
            }
            const cursor = context.pipelineState.cursor;
            const insertAt = cursor + 1;
            if (context.pipelineState.isStatic) {
                context.pipelineState.plan = [...context.pipelineState.plan];
                context.pipelineState.isStatic = false;
            }
            const newNodes = yield this.compiler.compilePartial(instructions, context.injector);
            context.pipelineState.plan.splice(insertAt, 0, ...newNodes);
        });
    }
};
RuntimePipelineUtils = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof KernelCompiler !== "undefined" && KernelCompiler) === "function" ? _a : Object])
], RuntimePipelineUtils);
export { RuntimePipelineUtils };