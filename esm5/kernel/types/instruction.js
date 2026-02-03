export var InstructionAction;
(function (InstructionAction) {
    InstructionAction["ADD"] = "ADD";
    InstructionAction["EXCLUDE"] = "EXCLUDE";
    InstructionAction["RESET"] = "RESET";
})(InstructionAction || (InstructionAction = {}));
export var Priority;
(function (Priority) {
    Priority[Priority["HIGH"] = 20] = "HIGH";
    Priority[Priority["LOW"] = 1] = "LOW";
    Priority[Priority["MEDIUM"] = 10] = "MEDIUM";
})(Priority || (Priority = {}));