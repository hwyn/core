var _a;
import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { RuntimeConfigurationException } from "../exceptions/index.js";
import { DynamicInstruction } from "../instruction/dynamic.js";
import { KernelPolicy } from "../policy/index.js";
import { Registry } from "../registry/registry.js";
let NodeFactory = class NodeFactory {
    constructor(registry) {
        this.registry = registry;
    }
    create(instruction, injector, context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // 1. Priority Check: Self-Resolving Instruction (Dynamic/Lambda)
                if (instruction instanceof DynamicInstruction) {
                    // If it's a dynamic instruction, try to let it resolve itself first.
                    try {
                        const executor = yield instruction.resolve(injector);
                        return {
                            id: `DYNAMIC-${instruction.slotName}-${Math.random().toString(36).substr(2, 9)}`,
                            executor,
                            instruction
                        };
                    }
                    catch (e) {
                        // If resolve() fails (e.g. not implemented), log a warning and fallback to Registry.
                        if (KernelPolicy.debugMode) {
                            KernelPolicy.logger.warn(`[NodeFactory] DynamicInstruction '${instruction.slotName}' self-resolution failed. Falling back to Registry.`, e.message);
                        }
                    }
                }
                // 2. Standard Path: Registry Lookup
                const protocol = ((_a = context === null || context === void 0 ? void 0 : context.seed) === null || _a === void 0 ? void 0 : _a.protocol) || instruction.protocol;
                if (!protocol) {
                    throw new RuntimeConfigurationException(`Cannot determine Protocol for slot: ${instruction.slotName}. Protocol context is required for resolution.`, { slotName: instruction.slotName });
                }
                const resolverToken = this.registry.getResolverToken(instruction.slotName, protocol);
                if (!resolverToken) {
                    throw new RuntimeConfigurationException(`No resolver registered for slot: ${instruction.slotName}. Ensure the Plugin providing this slot is loaded.`, { slotName: instruction.slotName });
                }
                const resolver = injector.get(resolverToken);
                if (!resolver || typeof resolver.resolve !== 'function') {
                    throw new RuntimeConfigurationException(`Invalid resolver implementation for slot: ${instruction.slotName}. Resolver must implement ISlotResolver.`, { slotName: instruction.slotName, resolvedValue: resolver });
                }
                const executor = yield resolver.resolve(instruction);
                return {
                    id: `${instruction.slotName}-${Math.random().toString(36).substr(2, 9)}`,
                    executor,
                    instruction
                };
            }
            catch (e) {
                const seed = context === null || context === void 0 ? void 0 : context.seed;
                let contextLabel = 'Unknown Context';
                if (seed) {
                    if (seed.aggregation === 'INGRESS_ONLY') {
                        const routeInfo = seed.route ? JSON.stringify(seed.route) : 'No Route';
                        contextLabel = `Ingress Route: ${routeInfo}`;
                    }
                    else {
                        const hostName = ((_b = seed.hostClass) === null || _b === void 0 ? void 0 : _b.name) || 'AnonymousClass';
                        const methodName = seed.propertyKey ? `.${String(seed.propertyKey)}` : '';
                        contextLabel = `${hostName}${methodName}`;
                    }
                }
                e.message = `Pipeline Compilation Failed for [${contextLabel}]\n` +
                    `  > Instruction: ${instruction.slotName} (Component: ${getComponentName(instruction.componentToken)})\n` +
                    `  > Reason: ${e.message}`;
                throw e;
            }
        });
    }
};
NodeFactory = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Registry !== "undefined" && Registry) === "function" ? _a : Object])
], NodeFactory);
export { NodeFactory };
function getComponentName(token) {
    if (!token)
        return 'N/A';
    if (typeof token === 'function')
        return token.name;
    return String(token);
}