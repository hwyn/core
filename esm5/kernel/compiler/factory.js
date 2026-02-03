import { __awaiter, __decorate, __generator, __metadata } from "tslib";
import { Injectable } from '@hwy-fm/di';
import { RuntimeConfigurationException } from "../exceptions/index.js";
import { DynamicInstruction } from "../instruction/dynamic.js";
import { KernelPolicy } from "../policy/index.js";
import { Registry } from "../registry/registry.js";
var NodeFactory = /** @class */ (function () {
    function NodeFactory(registry) {
        this.registry = registry;
    }
    NodeFactory.prototype.create = function (instruction, injector, context) {
        return __awaiter(this, void 0, Promise, function () {
            var executor_1, e_1, protocol, resolverToken, resolver, executor, e_2, seed, contextLabel, routeInfo, hostName, methodName;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        if (!(instruction instanceof DynamicInstruction)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, instruction.resolve(injector)];
                    case 2:
                        executor_1 = _c.sent();
                        return [2 /*return*/, {
                                id: "DYNAMIC-".concat(instruction.slotName, "-").concat(Math.random().toString(36).substr(2, 9)),
                                executor: executor_1,
                                instruction: instruction
                            }];
                    case 3:
                        e_1 = _c.sent();
                        // If resolve() fails (e.g. not implemented), log a warning and fallback to Registry.
                        if (KernelPolicy.debugMode) {
                            KernelPolicy.logger.warn("[NodeFactory] DynamicInstruction '".concat(instruction.slotName, "' self-resolution failed. Falling back to Registry."), e_1.message);
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        protocol = ((_a = context === null || context === void 0 ? void 0 : context.seed) === null || _a === void 0 ? void 0 : _a.protocol) || instruction.protocol;
                        if (!protocol) {
                            throw new RuntimeConfigurationException("Cannot determine Protocol for slot: ".concat(instruction.slotName, ". Protocol context is required for resolution."), { slotName: instruction.slotName });
                        }
                        resolverToken = this.registry.getResolverToken(instruction.slotName, protocol);
                        if (!resolverToken) {
                            throw new RuntimeConfigurationException("No resolver registered for slot: ".concat(instruction.slotName, ". Ensure the Plugin providing this slot is loaded."), { slotName: instruction.slotName });
                        }
                        resolver = injector.get(resolverToken);
                        if (!resolver || typeof resolver.resolve !== 'function') {
                            throw new RuntimeConfigurationException("Invalid resolver implementation for slot: ".concat(instruction.slotName, ". Resolver must implement ISlotResolver."), { slotName: instruction.slotName, resolvedValue: resolver });
                        }
                        return [4 /*yield*/, resolver.resolve(instruction)];
                    case 5:
                        executor = _c.sent();
                        return [2 /*return*/, {
                                id: "".concat(instruction.slotName, "-").concat(Math.random().toString(36).substr(2, 9)),
                                executor: executor,
                                instruction: instruction
                            }];
                    case 6:
                        e_2 = _c.sent();
                        seed = context === null || context === void 0 ? void 0 : context.seed;
                        contextLabel = 'Unknown Context';
                        if (seed) {
                            if (seed.aggregation === 'INGRESS_ONLY') {
                                routeInfo = seed.route ? JSON.stringify(seed.route) : 'No Route';
                                contextLabel = "Ingress Route: ".concat(routeInfo);
                            }
                            else {
                                hostName = ((_b = seed.hostClass) === null || _b === void 0 ? void 0 : _b.name) || 'AnonymousClass';
                                methodName = seed.propertyKey ? ".".concat(String(seed.propertyKey)) : '';
                                contextLabel = "".concat(hostName).concat(methodName);
                            }
                        }
                        e_2.message = "Pipeline Compilation Failed for [".concat(contextLabel, "]\n") +
                            "  > Instruction: ".concat(instruction.slotName, " (Component: ").concat(getComponentName(instruction.componentToken), ")\n") +
                            "  > Reason: ".concat(e_2.message);
                        throw e_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    var _a;
    NodeFactory = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof Registry !== "undefined" && Registry) === "function" ? _a : Object])
    ], NodeFactory);
    return NodeFactory;
}());
export { NodeFactory };
function getComponentName(token) {
    if (!token)
        return 'N/A';
    if (typeof token === 'function')
        return token.name;
    return String(token);
}