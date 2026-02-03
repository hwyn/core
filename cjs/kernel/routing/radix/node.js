"use strict";
// Node Types for cleaner structure
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadixNode = exports.NodeFlag = exports.NodeType = void 0;
var NodeType;
(function (NodeType) {
    NodeType[NodeType["STATIC"] = 0] = "STATIC";
    NodeType[NodeType["PARAM"] = 1] = "PARAM";
    NodeType[NodeType["WILDCARD"] = 2] = "WILDCARD";
    NodeType[NodeType["DEEP"] = 3] = "DEEP";
})(NodeType || (exports.NodeType = NodeType = {}));
var NodeFlag;
(function (NodeFlag) {
    NodeFlag[NodeFlag["NONE"] = 0] = "NONE";
    NodeFlag[NodeFlag["HAS_STORE"] = 1] = "HAS_STORE";
})(NodeFlag || (exports.NodeFlag = NodeFlag = {}));
var RadixNode = /** @class */ (function () {
    function RadixNode() {
        this.children = new Map();
        this.dynamic = [];
        this.store = null;
    }
    RadixNode.prototype.getOrCreateStatic = function (path) {
        if (!this.children.has(path))
            this.children.set(path, new RadixNode());
        return this.children.get(path);
    };
    RadixNode.prototype.getOrCreateDynamic = function (type, param) {
        var entry = this.dynamic.find(function (x) { return x.type === type && x.param === param; });
        if (!entry) {
            entry = { type: type, param: param, node: new RadixNode() };
            // Sort to ensure priority: PARAM > WILDCARD > DEEP
            this.dynamic.push(entry);
            this.dynamic.sort(function (a, b) { return a.type - b.type; });
        }
        return entry.node;
    };
    return RadixNode;
}());
exports.RadixNode = RadixNode;