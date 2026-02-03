"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Priority = exports.InstructionAction = void 0;
var InstructionAction;
(function (InstructionAction) {
    InstructionAction["ADD"] = "ADD";
    InstructionAction["EXCLUDE"] = "EXCLUDE";
    InstructionAction["RESET"] = "RESET";
})(InstructionAction || (exports.InstructionAction = InstructionAction = {}));
var Priority;
(function (Priority) {
    Priority[Priority["HIGH"] = 20] = "HIGH";
    Priority[Priority["LOW"] = 1] = "LOW";
    Priority[Priority["MEDIUM"] = 10] = "MEDIUM";
})(Priority || (exports.Priority = Priority = {}));