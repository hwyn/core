import { createRegisterLoader } from '@hwy-fm/core/platform/decorator';
import { INSTRUCTION_QUEUE, InstructionAction } from "../types/index.js";
export const registerInstruction = createRegisterLoader(INSTRUCTION_QUEUE);
export function createPipelineDecorator(options, props) {
    const { slot, action = InstructionAction.ADD, protocol, strategy } = options;
    const metadataFactory = props || ((...args) => ({ payload: args.length > 1 ? args : args[0] }));
    return (...args) => (target, propertyKey, descriptor) => {
        const hostClass = propertyKey ? target.constructor : target;
        const desc = metadataFactory(...args) || {};
        registerInstruction({
            hostClass,
            propertyKey,
            slotName: slot,
            route: desc.route,
            action: desc.action || action,
            componentToken: desc.componentToken,
            payload: desc.payload,
            protocol: desc.protocol || protocol, // Direct override > Factory default
            strategy: desc.strategy || strategy
        });
    };
}