"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimePipelineUtils = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var compiler_1 = require("../compiler/compiler");
var policy_1 = require("../policy");
var RuntimePipelineUtils = /** @class */ (function () {
    function RuntimePipelineUtils(compiler) {
        this.compiler = compiler;
    }
    RuntimePipelineUtils.prototype.getPlan = function (context) {
        var _a;
        return ((_a = context.pipelineState) === null || _a === void 0 ? void 0 : _a.plan) || [];
    };
    RuntimePipelineUtils.prototype.inject = function (context, instructions) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var cursor, insertAt, newNodes;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!context.pipelineState) {
                            policy_1.KernelPolicy.logger.warn('[Runtime] Pipeline state missing during inject. Ignoring.');
                            return [2 /*return*/];
                        }
                        cursor = context.pipelineState.cursor;
                        insertAt = cursor + 1;
                        if (context.pipelineState.isStatic) {
                            context.pipelineState.plan = tslib_1.__spreadArray([], tslib_1.__read(context.pipelineState.plan), false);
                            context.pipelineState.isStatic = false;
                        }
                        return [4 /*yield*/, this.compiler.compilePartial(instructions, context.injector)];
                    case 1:
                        newNodes = _b.sent();
                        (_a = context.pipelineState.plan).splice.apply(_a, tslib_1.__spreadArray([insertAt, 0], tslib_1.__read(newNodes), false));
                        return [2 /*return*/];
                }
            });
        });
    };
    var _a;
    RuntimePipelineUtils = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof compiler_1.KernelCompiler !== "undefined" && compiler_1.KernelCompiler) === "function" ? _a : Object])
    ], RuntimePipelineUtils);
    return RuntimePipelineUtils;
}());
exports.RuntimePipelineUtils = RuntimePipelineUtils;