"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadixTree = void 0;
var tslib_1 = require("tslib");
var node_1 = require("./node");
var RadixTree = /** @class */ (function () {
    function RadixTree() {
        this.root = new node_1.RadixNode();
    }
    RadixTree.prototype.insert = function (path, payload) {
        var e_1, _a;
        var parts = this.splitPath(path);
        var node = this.root;
        var paramNames = [];
        try {
            for (var parts_1 = tslib_1.__values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                var part = parts_1_1.value;
                if (part === '**') {
                    node = node.getOrCreateDynamic(node_1.NodeType.DEEP);
                    break;
                }
                else if (part === '*') {
                    node = node.getOrCreateDynamic(node_1.NodeType.WILDCARD);
                }
                else if (part.startsWith(':')) {
                    var name = part.slice(1);
                    paramNames.push(name);
                    node = node.getOrCreateDynamic(node_1.NodeType.PARAM, name);
                }
                else {
                    node = node.getOrCreateStatic(part);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Cast payload safely as we control the PipelineRunner integration layer
        node.store = { runner: payload, params: paramNames };
    };
    RadixTree.prototype.search = function (path) {
        var parts = this.splitPath(path);
        var params = {};
        var resultNode = this.findNode(this.root, parts, 0, params);
        if (resultNode === null || resultNode === void 0 ? void 0 : resultNode.store) {
            return {
                payload: resultNode.store.runner,
                params: params
            };
        }
        return null;
    };
    RadixTree.prototype.splitPath = function (path) {
        if (!path || path === '/')
            return [];
        // Faster than filter: manually push non-empty
        var parts = [];
        var start = 0;
        if (path.charCodeAt(0) === 47)
            start = 1; // Skip leading /
        var nextIdx = path.indexOf('/', start);
        while (nextIdx !== -1) {
            if (nextIdx > start) {
                parts.push(path.substring(start, nextIdx));
            }
            start = nextIdx + 1;
            nextIdx = path.indexOf('/', start);
        }
        if (start < path.length) {
            parts.push(path.substring(start));
        }
        return parts;
    };
    RadixTree.prototype.findNode = function (node, parts, idx, params) {
        var e_2, _a;
        // 1. Base Case: End of path
        if (idx === parts.length) {
            // Exact match?
            if (node.store)
                return node;
            // Handle "Trailing Slash" or "Deep Wildcard" scenario?
            // If we are at end, but current node has a DEEP child, does it match?
            // Usually /foo matches /foo/**
            var deep = node.dynamic.find(function (x) { return x.type === node_1.NodeType.DEEP; });
            if (deep === null || deep === void 0 ? void 0 : deep.node.store)
                return deep.node;
            return undefined;
        }
        var part = parts[idx];
        // 2. Static Match (Priority 1)
        var staticChild = node.children.get(part);
        if (staticChild) {
            var res = this.findNode(staticChild, parts, idx + 1, params);
            if (res)
                return res;
        }
        try {
            // 3. Dynamic Matches (Priority 2)
            // Sorted by specificity in Node (Param > Wildcard > Deep)
            for (var _b = tslib_1.__values(node.dynamic), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entry = _c.value;
                if (entry.type === node_1.NodeType.DEEP) {
                    // ** matches everything remaining
                    if (entry.node.store)
                        return entry.node;
                }
                else {
                    // Collect param if needed
                    if (entry.type === node_1.NodeType.PARAM) {
                        params[entry.param] = part;
                    }
                    var res = this.findNode(entry.node, parts, idx + 1, params);
                    if (res)
                        return res;
                    // Backtrack: Remove param if path didn't match down this branch
                    if (entry.type === node_1.NodeType.PARAM) {
                        delete params[entry.param];
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return undefined;
    };
    return RadixTree;
}());
exports.RadixTree = RadixTree;