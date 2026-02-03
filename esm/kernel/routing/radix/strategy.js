import { __decorate } from "tslib";
import { Injectable, MultiToken } from '@hwy-fm/di';
import { ROUTE_MATCHER } from "../strategy.js";
import { parseContextUrl } from "./context-parser.js";
import { RouteMatcher } from "./matcher.js";
import { RadixTree } from "./tree.js";
let RadixRouterStrategy = class RadixRouterStrategy {
    constructor() {
        this.trees = new Map();
        this.fallbackRules = [];
    }
    add(route, runner) {
        const info = RouteMatcher.analyze(route);
        if (info.fallback) {
            this.addFallbackRule(route, runner);
        }
        else {
            this.getTree(info.method).insert(info.path, runner);
        }
    }
    match(context) {
        var _a, _b;
        const { method, path } = parseContextUrl(context);
        // 1. Exact Method Tree
        const specificMatch = (_a = this.trees.get(method)) === null || _a === void 0 ? void 0 : _a.search(path);
        if (specificMatch) {
            return this.createResult(specificMatch.payload, specificMatch.params);
        }
        // 2. Generic 'ALL' Tree
        if (method !== 'ALL') {
            const genericMatch = (_b = this.trees.get('ALL')) === null || _b === void 0 ? void 0 : _b.search(path);
            if (genericMatch) {
                return this.createResult(genericMatch.payload, genericMatch.params);
            }
        }
        // 3. Fallback Rules
        return this.matchFallback(method, path);
    }
    check(route, context) {
        const { method, path } = parseContextUrl(context);
        return RouteMatcher.isMatch(route, method, path);
    }
    contains(pattern, target) {
        const pat = RouteMatcher.normalize(pattern);
        const tgt = RouteMatcher.normalize(target);
        // Method mismatch
        if (pat.method !== 'ALL') {
            if (tgt.method !== 'ALL' && pat.method !== tgt.method)
                return false;
        }
        if (!pat.path)
            return true;
        if (!tgt.path)
            return false;
        return RouteMatcher.isMatch(pattern, tgt.method, tgt.path.toString());
    }
    // --- Private Helpers ---
    getTree(method) {
        let tree = this.trees.get(method);
        if (!tree) {
            tree = new RadixTree();
            this.trees.set(method, tree);
        }
        return tree;
    }
    createResult(runner, params) {
        return {
            runner,
            params: Object.keys(params).length > 0 ? params : undefined
        };
    }
    addFallbackRule(route, runner) {
        const key = this.getRouteKey(route);
        const existingIndex = this.fallbackRules.findIndex(r => this.getRouteKey(r.def) === key);
        const regex = RouteMatcher.compile(route);
        if (existingIndex !== -1) {
            this.fallbackRules[existingIndex].runner = runner;
            this.fallbackRules[existingIndex].regex = regex;
        }
        else {
            this.fallbackRules.push({ def: route, runner, regex });
        }
    }
    matchFallback(method, path) {
        for (const rule of this.fallbackRules) {
            // Check Regex Cache first
            if (rule.regex) {
                if (!this.isMethodMatch(rule.def, method))
                    continue;
                const match = rule.regex.exec(path);
                if (match) {
                    return {
                        runner: rule.runner,
                        params: match.groups ? Object.assign({}, match.groups) : undefined
                    };
                }
            }
            // Standard Match check
            else if (RouteMatcher.isMatch(rule.def, method, path)) {
                return { runner: rule.runner };
            }
        }
        return undefined;
    }
    isMethodMatch(def, reqMethod) {
        if (typeof def === 'string' || def instanceof RegExp)
            return true;
        const defMethod = (def.method || 'ALL').toUpperCase();
        return defMethod === 'ALL' || defMethod === reqMethod;
    }
    getRouteKey(def) {
        if (def instanceof RegExp)
            return def.toString();
        if (typeof def === 'string')
            return `ALL:${def}`;
        const method = (def.method || 'ALL').toUpperCase();
        const path = def.path instanceof RegExp ? def.path.toString() : def.path;
        return `${method}:${path}`;
    }
};
RadixRouterStrategy = __decorate([
    MultiToken(ROUTE_MATCHER),
    Injectable()
], RadixRouterStrategy);
export { RadixRouterStrategy };