import { RadixNode, NodeType } from "./node.js";
export class RadixTree {
    constructor() {
        this.root = new RadixNode();
    }
    insert(path, payload) {
        const parts = this.splitPath(path);
        let node = this.root;
        const paramNames = [];
        for (const part of parts) {
            if (part === '**') {
                node = node.getOrCreateDynamic(NodeType.DEEP);
                break;
            }
            else if (part === '*') {
                node = node.getOrCreateDynamic(NodeType.WILDCARD);
            }
            else if (part.startsWith(':')) {
                const name = part.slice(1);
                paramNames.push(name);
                node = node.getOrCreateDynamic(NodeType.PARAM, name);
            }
            else {
                node = node.getOrCreateStatic(part);
            }
        }
        // Cast payload safely as we control the PipelineRunner integration layer
        node.store = { runner: payload, params: paramNames };
    }
    search(path) {
        const parts = this.splitPath(path);
        const params = {};
        const resultNode = this.findNode(this.root, parts, 0, params);
        if (resultNode === null || resultNode === void 0 ? void 0 : resultNode.store) {
            return {
                payload: resultNode.store.runner,
                params
            };
        }
        return null;
    }
    splitPath(path) {
        if (!path || path === '/')
            return [];
        // Faster than filter: manually push non-empty
        const parts = [];
        let start = 0;
        if (path.charCodeAt(0) === 47)
            start = 1; // Skip leading /
        let nextIdx = path.indexOf('/', start);
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
    }
    findNode(node, parts, idx, params) {
        // 1. Base Case: End of path
        if (idx === parts.length) {
            // Exact match?
            if (node.store)
                return node;
            // Handle "Trailing Slash" or "Deep Wildcard" scenario?
            // If we are at end, but current node has a DEEP child, does it match?
            // Usually /foo matches /foo/**
            const deep = node.dynamic.find(x => x.type === NodeType.DEEP);
            if (deep === null || deep === void 0 ? void 0 : deep.node.store)
                return deep.node;
            return undefined;
        }
        const part = parts[idx];
        // 2. Static Match (Priority 1)
        const staticChild = node.children.get(part);
        if (staticChild) {
            const res = this.findNode(staticChild, parts, idx + 1, params);
            if (res)
                return res;
        }
        // 3. Dynamic Matches (Priority 2)
        // Sorted by specificity in Node (Param > Wildcard > Deep)
        for (const entry of node.dynamic) {
            if (entry.type === NodeType.DEEP) {
                // ** matches everything remaining
                if (entry.node.store)
                    return entry.node;
            }
            else {
                // Collect param if needed
                if (entry.type === NodeType.PARAM) {
                    params[entry.param] = part;
                }
                const res = this.findNode(entry.node, parts, idx + 1, params);
                if (res)
                    return res;
                // Backtrack: Remove param if path didn't match down this branch
                if (entry.type === NodeType.PARAM) {
                    delete params[entry.param];
                }
            }
        }
        return undefined;
    }
}