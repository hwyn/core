import { InstructionAction } from "../types/index.js";
import { registerInstruction } from "./factory.js";
function createDecorator(action) {
    return (options) => {
        return (target, propertyKey) => {
            const actualTarget = propertyKey ? target.constructor : target;
            registerInstruction({
                hostClass: actualTarget,
                propertyKey,
                slotName: options.slot,
                action,
                componentToken: options.componentToken,
                payload: options.payload,
                protocol: options.protocol
            });
        };
    };
}
const AttachFn = createDecorator(InstructionAction.ADD);
export const Attach = Object.assign(AttachFn, {
    Add: createDecorator(InstructionAction.ADD),
    Exclude: createDecorator(InstructionAction.EXCLUDE),
    Reset: createDecorator(InstructionAction.RESET)
});