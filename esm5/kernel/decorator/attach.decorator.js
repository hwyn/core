import { InstructionAction } from "../types/index.js";
import { registerInstruction } from "./factory.js";
function createDecorator(action) {
    return function (options) {
        return function (target, propertyKey) {
            var actualTarget = propertyKey ? target.constructor : target;
            registerInstruction({
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
var AttachFn = createDecorator(InstructionAction.ADD);
export var Attach = Object.assign(AttachFn, {
    Add: createDecorator(InstructionAction.ADD),
    Exclude: createDecorator(InstructionAction.EXCLUDE),
    Reset: createDecorator(InstructionAction.RESET)
});