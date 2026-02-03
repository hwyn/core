"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInstruction = void 0;
exports.createPipelineDecorator = createPipelineDecorator;
var tslib_1 = require("tslib");
var decorator_1 = require("@hwy-fm/core/platform/decorator");
var types_1 = require("../types");
exports.registerInstruction = (0, decorator_1.createRegisterLoader)(types_1.INSTRUCTION_QUEUE);
function createPipelineDecorator(options, props) {
    var slot = options.slot, _a = options.action, action = _a === void 0 ? types_1.InstructionAction.ADD : _a, protocol = options.protocol, strategy = options.strategy;
    var metadataFactory = props || (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return ({ payload: args.length > 1 ? args : args[0] });
    });
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return function (target, propertyKey, descriptor) {
            var hostClass = propertyKey ? target.constructor : target;
            var desc = metadataFactory.apply(void 0, tslib_1.__spreadArray([], tslib_1.__read(args), false)) || {};
            (0, exports.registerInstruction)({
                hostClass: hostClass,
                propertyKey: propertyKey,
                slotName: slot,
                route: desc.route,
                action: desc.action || action,
                componentToken: desc.componentToken,
                payload: desc.payload,
                protocol: desc.protocol || protocol, // Direct override > Factory default
                strategy: desc.strategy || strategy
            });
        };
    };
}