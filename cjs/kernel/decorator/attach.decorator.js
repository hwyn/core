"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attach = void 0;
var types_1 = require("../types");
var factory_1 = require("./factory");
function createDecorator(action) {
    return function (options) {
        return function (target, propertyKey) {
            var actualTarget = propertyKey ? target.constructor : target;
            (0, factory_1.registerInstruction)({
                hostClass: actualTarget,
                propertyKey: propertyKey,
                slotName: options.slot,
                action: action,
                componentToken: options.componentToken,
                payload: options.payload,
                protocol: options.protocol
            });
        };
    };
}
var AttachFn = createDecorator(types_1.InstructionAction.ADD);
exports.Attach = Object.assign(AttachFn, {
    Add: createDecorator(types_1.InstructionAction.ADD),
    Exclude: createDecorator(types_1.InstructionAction.EXCLUDE),
    Reset: createDecorator(types_1.InstructionAction.RESET)
});