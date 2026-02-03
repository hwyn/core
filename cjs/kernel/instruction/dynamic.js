"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaInstruction = exports.DynamicInstruction = void 0;
var tslib_1 = require("tslib");
var types_1 = require("../types");
/**
 * A dummy class used as the 'host' for dynamically injected instructions.
 * It serves as a marker in debug logs to identify runtime-injected components.
 */
var DynamicContextHost = /** @class */ (function () {
    function DynamicContextHost() {
    }
    return DynamicContextHost;
}());
/**
 * Base class for creating lightweight, dynamic instructions that can be injected at runtime.
 *
 * It automatically fills in the required fields like `hostClass` (using a dummy placeholder)
 * and `action`, allowing developers to focus simply on the Slot and Payload.
 */
var DynamicInstruction = /** @class */ (function () {
    function DynamicInstruction(slotName, protocol, payload) {
        this.action = types_1.InstructionAction.ADD;
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
    DynamicInstruction.prototype.resolve = function (injector) {
        throw new Error('DynamicInstruction: resolve() not implemented. Either override this method or register a Resolver for this slot.');
    };
    return DynamicInstruction;
}());
exports.DynamicInstruction = DynamicInstruction;
var LambdaInstruction = /** @class */ (function (_super) {
    tslib_1.__extends(LambdaInstruction, _super);
    function LambdaInstruction(runner, protocol) {
        var _this = _super.call(this, 'LAMBDA_INSTRUCTION', protocol) || this;
        _this.runner = runner;
        return _this;
    }
    LambdaInstruction.prototype.resolve = function () {
        return this.runner;
    };
    return LambdaInstruction;
}(DynamicInstruction));
exports.LambdaInstruction = LambdaInstruction;