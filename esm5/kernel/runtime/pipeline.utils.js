import { __awaiter, __decorate, __generator, __metadata, __read, __spreadArray } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { KernelCompiler } from "../compiler/compiler.js";
import { KernelPolicy } from "../policy/index.js";
var RuntimePipelineUtils = /** @class */ (function () {
    function RuntimePipelineUtils(compiler) {
        this.compiler = compiler;
    }
    RuntimePipelineUtils.prototype.getPlan = function (context) {
        var _a;
        return ((_a = context.pipelineState) === null || _a === void 0 ? void 0 : _a.plan) || [];
    };
    RuntimePipelineUtils.prototype.inject = function (context, instructions) {
        return __awaiter(this, void 0, Promise, function () {
            var cursor, insertAt, newNodes;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!context.pipelineState) {
                            KernelPolicy.logger.warn('[Runtime] Pipeline state missing during inject. Ignoring.');
                            return [2 /*return*/];
                        }
                        cursor = context.pipelineState.cursor;
                        insertAt = cursor + 1;
                        if (context.pipelineState.isStatic) {
                            context.pipelineState.plan = __spreadArray([], __read(context.pipelineState.plan), false);
                            context.pipelineState.isStatic = false;
                        }
                        return [4 /*yield*/, this.compiler.compilePartial(instructions, context.injector)];
                    case 1:
                        newNodes = _b.sent();
                        (_a = context.pipelineState.plan).splice.apply(_a, __spreadArray([insertAt, 0], __read(newNodes), false));
                        return [2 /*return*/];
                }
            });
        });
    };
    var _a;
    RuntimePipelineUtils = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof KernelCompiler !== "undefined" && KernelCompiler) === "function" ? _a : Object])
    ], RuntimePipelineUtils);
    return RuntimePipelineUtils;
}());
export { RuntimePipelineUtils };