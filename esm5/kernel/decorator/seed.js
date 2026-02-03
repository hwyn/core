import { __assign, __read, __spreadArray } from "tslib";
import { createRegisterLoader } from '@hwy-fm/core/platform/decorator';
import { setInjectableDef } from '@hwy-fm/di';
import { InstructionAction, SEED_TOKEN } from "../types/index.js";
import { EXECUTE_METHOD_NAME } from "../types/seed-contract.js";
import { registerInstruction } from "./factory.js";
export var registerSeed = createRegisterLoader(SEED_TOKEN);
/**
 * Creates a decorator factory for Seed instructions that supports both **Class** and **Method** usage.
 *
 * A Seed instruction acts as the starting point or context boundary for a Pipeline.
 *
 * **1. Class Decorator Mode (New Standard):**
 * - Use this when the entire Class represents a business unit.
 * - **Requirements**: The class MUST implement the `ExecutableSeed` interface (i.e., contain an `execute(ctx)` method).
 * - **Feature**: Automatically marks the class as `@Injectable`.
 *
 * **2. Method Decorator Mode (Legacy Support):**
 * - Use this to expose a specific method within a Container as a Seed.
 * - Does not enforce strict interfaces but requires the container to be registered in DI.
 *
 * **Routing & Registration Behavior:**
 * If the resulting metadata does NOT contain a `route`:
 * 1. For `PROCESS_DEF` aggregation: It throws an error, as business processes require a route.
 * 2. For others (e.g., `INGRESS_ONLY`): It **downgrades** to a standard instruction registration (`registerInstruction`).
 *    This means it will NOT be collected as a standalone Seed (under `SEED_TOKEN`) and cannot initiate a pipeline on its own;
 *    instead, it will be treated as a regular instruction attached to the host.
 *
 * @param options Configuration options for the seed factory
 * @param props Adapter function to transform arguments into Seed metadata
 */
export function createSeedDecorator(options, props) {
    var slot = options.slot, aggregation = options.aggregation, _a = options.profile, profile = _a === void 0 ? 'default' : _a, protocol = options.protocol, strategy = options.strategy;
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
        return (function (target, propertyKey, descriptor) {
            // Different handling for Class vs Method
            var isClassDecorator = !propertyKey;
            var hostClass = isClassDecorator ? target : target.constructor;
            var computedPropertyKey = isClassDecorator ? EXECUTE_METHOD_NAME : propertyKey;
            // Validation for Class Seeds: Check if 'execute' method exists
            if (isClassDecorator) {
                if (typeof target.prototype[EXECUTE_METHOD_NAME] !== 'function') {
                    throw new Error("[Seed Decorator] Class '".concat(target.name, "' is decorated as a @Seed but does not implement the '").concat(EXECUTE_METHOD_NAME, "' method. Please implement the ExecutableSeed interface."));
                }
                setInjectableDef(target);
            }
            var result = metadataFactory.apply(void 0, __spreadArray([], __read(args), false)) || {};
            var hasRoute = !!result.route;
            var finalAggregation = result.aggregation || aggregation;
            var effectiveProtocol = result.protocol || protocol;
            if (!effectiveProtocol) {
                throw new Error("[Seed Decorator] Protocol is required for @".concat(slot, ". Please specify a valid protocol (e.g. HTTP_PROTOCOL). Target: ").concat(hostClass === null || hostClass === void 0 ? void 0 : hostClass.name));
            }
            if (finalAggregation === 'PROCESS_DEF' && !hasRoute) {
                throw new Error("[".concat(slot, "] PROCESS_DEF seed must provide a route. Target: ").concat(hostClass === null || hostClass === void 0 ? void 0 : hostClass.name));
            }
            var desc = __assign(__assign({ action: InstructionAction.ADD }, result), { hostClass: hostClass, propertyKey: computedPropertyKey, slotName: slot, aggregation: finalAggregation, profile: result.profile || profile, protocol: result.protocol || protocol, strategy: result.strategy || strategy });
            registerInstruction(desc);
            if (hasRoute) {
                registerSeed(desc);
            }
        });
    };
}