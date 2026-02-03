import { InstructionAction } from "../types/index.js";
/**
 * A dummy class used as the 'host' for dynamically injected instructions.
 * It serves as a marker in debug logs to identify runtime-injected components.
 */
class DynamicContextHost {
}
/**
 * Base class for creating lightweight, dynamic instructions that can be injected at runtime.
 *
 * It automatically fills in the required fields like `hostClass` (using a dummy placeholder)
 * and `action`, allowing developers to focus simply on the Slot and Payload.
 */
export class DynamicInstruction {
    constructor(slotName, protocol, payload) {
        this.action = InstructionAction.ADD;
        // These properties are required by the interface but irrelevant for dynamic runtime injection.
        // We provide safe defaults.
        this.hostClass = DynamicContextHost;
        this.propertyKey = 'dynamicInject';
        this.slotName = slotName;
        this.protocol = protocol;
        this.payload = payload;
    }
    // Default behavior: throw error. 
    // Subclasses that want to be self-resolving MUST override this.
    // Or usage of LambdaInstruction.
    resolve(injector) {
        throw new Error('DynamicInstruction: resolve() not implemented. Either override this method or register a Resolver for this slot.');
    }
}
export class LambdaInstruction extends DynamicInstruction {
    constructor(runner, protocol) {
        super('LAMBDA_INSTRUCTION', protocol);
        this.runner = runner;
    }
    resolve() {
        return this.runner;
    }
}