// Node Types for cleaner structure
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["STATIC"] = 0] = "STATIC";
    NodeType[NodeType["PARAM"] = 1] = "PARAM";
    NodeType[NodeType["WILDCARD"] = 2] = "WILDCARD";
    NodeType[NodeType["DEEP"] = 3] = "DEEP";
})(NodeType || (NodeType = {}));
export var NodeFlag;
(function (NodeFlag) {
    NodeFlag[NodeFlag["NONE"] = 0] = "NONE";
    NodeFlag[NodeFlag["HAS_STORE"] = 1] = "HAS_STORE";
})(NodeFlag || (NodeFlag = {}));
export class RadixNode {
    constructor() {
        this.children = new Map();
        this.dynamic = [];
        this.store = null;
    }
    getOrCreateStatic(path) {
        if (!this.children.has(path))
            this.children.set(path, new RadixNode());
        return this.children.get(path);
    }
    getOrCreateDynamic(type, param) {
        let entry = this.dynamic.find((x) => x.type === type && x.param === param);
        if (!entry) {
            entry = { type, param, node: new RadixNode() };
            // Sort to ensure priority: PARAM > WILDCARD > DEEP
            this.dynamic.push(entry);
            this.dynamic.sort((a, b) => a.type - b.type);
        }
        return entry.node;
    }
}