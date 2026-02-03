import { __assign, __decorate, __values } from "tslib";
import { Injectable, MultiToken } from '@hwy-fm/di';
import { ROUTE_MATCHER } from "../strategy.js";
import { parseContextUrl } from "./context-parser.js";
import { RouteMatcher } from "./matcher.js";
import { RadixTree } from "./tree.js";
var RadixRouterStrategy = /** @class */ (function () {
    function RadixRouterStrategy() {
        this.trees = new Map();
        this.fallbackRules = [];
    }
    RadixRouterStrategy.prototype.add = function (route, runner) {
        var info = RouteMatcher.analyze(route);
        if (info.fallback) {
            this.addFallbackRule(route, runner);
        }
        else {
            this.getTree(info.method).insert(info.path, runner);
        }
    };
    RadixRouterStrategy.prototype.match = function (context) {
        var _a, _b;
        var _c = parseContextUrl(context), method = _c.method, path = _c.path;
        // 1. Exact Method Tree
        var specificMatch = (_a = this.trees.get(method)) === null || _a === void 0 ? void 0 : _a.search(path);
        if (specificMatch) {
            return this.createResult(specificMatch.payload, specificMatch.params);
        }
        // 2. Generic 'ALL' Tree
        if (method !== 'ALL') {
            var genericMatch = (_b = this.trees.get('ALL')) === null || _b === void 0 ? void 0 : _b.search(path);
            if (genericMatch) {
                return this.createResult(genericMatch.payload, genericMatch.params);
            }
        }
        // 3. Fallback Rules
        return this.matchFallback(method, path);
    };
    RadixRouterStrategy.prototype.check = function (route, context) {
        var _a = parseContextUrl(context), method = _a.method, path = _a.path;
        return RouteMatcher.isMatch(route, method, path);
    };
    RadixRouterStrategy.prototype.contains = function (pattern, target) {
        var pat = RouteMatcher.normalize(pattern);
        var tgt = RouteMatcher.normalize(target);
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
    };
    // --- Private Helpers ---
    RadixRouterStrategy.prototype.getTree = function (method) {
        var tree = this.trees.get(method);
        if (!tree) {
            tree = new RadixTree();
            this.trees.set(method, tree);
        }
        return tree;
    };
    RadixRouterStrategy.prototype.createResult = function (runner, params) {
        return {
            runner: runner,
            params: Object.keys(params).length > 0 ? params : undefined
        };
    };
    RadixRouterStrategy.prototype.addFallbackRule = function (route, runner) {
        var _this = this;
        var key = this.getRouteKey(route);
        var existingIndex = this.fallbackRules.findIndex(function (r) { return _this.getRouteKey(r.def) === key; });
        var regex = RouteMatcher.compile(route);
        if (existingIndex !== -1) {
            this.fallbackRules[existingIndex].runner = runner;
            this.fallbackRules[existingIndex].regex = regex;
        }
        else {
            this.fallbackRules.push({ def: route, runner: runner, regex: regex });
        }
    };
    RadixRouterStrategy.prototype.matchFallback = function (method, path) {
        var e_1, _a;
        try {
            for (var _b = __values(this.fallbackRules), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rule = _c.value;
                // Check Regex Cache first
                if (rule.regex) {
                    if (!this.isMethodMatch(rule.def, method))
                        continue;
                    var match = rule.regex.exec(path);
                    if (match) {
                        return {
                            runner: rule.runner,
                            params: match.groups ? __assign({}, match.groups) : undefined
                        };
                    }
                }
                // Standard Match check
                else if (RouteMatcher.isMatch(rule.def, method, path)) {
                    return { runner: rule.runner };
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return undefined;
    };
    RadixRouterStrategy.prototype.isMethodMatch = function (def, reqMethod) {
        if (typeof def === 'string' || def instanceof RegExp)
            return true;
        var defMethod = (def.method || 'ALL').toUpperCase();
        return defMethod === 'ALL' || defMethod === reqMethod;
    };
    RadixRouterStrategy.prototype.getRouteKey = function (def) {
        if (def instanceof RegExp)
            return def.toString();
        if (typeof def === 'string')
            return "ALL:".concat(def);
        var method = (def.method || 'ALL').toUpperCase();
        var path = def.path instanceof RegExp ? def.path.toString() : def.path;
        return "".concat(method, ":").concat(path);
    };
    RadixRouterStrategy = __decorate([
        MultiToken(ROUTE_MATCHER),
        Injectable()
    ], RadixRouterStrategy);
    return RadixRouterStrategy;
}());
export { RadixRouterStrategy };