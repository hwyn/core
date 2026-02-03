import { __read, __spreadArray } from "tslib";
import { createRegisterLoader } from '@hwy-fm/core/platform/decorator';
import { INSTRUCTION_QUEUE, InstructionAction } from "../types/index.js";
export var registerInstruction = createRegisterLoader(INSTRUCTION_QUEUE);
export function createPipelineDecorator(options, props) {
    var slot = options.slot, _a = options.action, action = _a === void 0 ? InstructionAction.ADD : _a, protocol = options.protocol, strategy = options.strategy;
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
            var desc = metadataFactory.apply(void 0, __spreadArray([], __read(args), false)) || {};
            registerInstruction({
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