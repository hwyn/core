"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteMatcher = void 0;
var tslib_1 = require("tslib");
var RouteMatcher = /** @class */ (function () {
    function RouteMatcher() {
    }
    RouteMatcher.normalize = function (def) {
        if (typeof def === 'string')
            return { method: 'ALL', path: def };
        if (def instanceof RegExp)
            return { method: 'ALL', path: def };
        return {
            method: (def.method || 'ALL').toUpperCase(),
            path: def.path
        };
    };
    RouteMatcher.isMatch = function (routeDef, reqMethod, reqPath) {
        if (routeDef instanceof RegExp)
            return routeDef.test(reqPath);
        if (typeof routeDef === 'string')
            return this.matchPathLogic(routeDef, reqPath);
        var method = (routeDef.method || 'ALL').toUpperCase();
        if (method !== 'ALL' && method !== reqMethod)
            return false;
        if (routeDef.path instanceof RegExp) {
            return routeDef.path.test(reqPath);
        }
        if (typeof routeDef.path === 'string') {
            return this.matchPathLogic(routeDef.path, reqPath);
        }
        return true;
    };
    RouteMatcher.analyze = function (route) {
        var e_1, _a;
        if (route instanceof RegExp)
            return { method: 'ALL', fallback: true };
        var r = typeof route === 'string' ? { path: route, method: 'ALL' } : route;
        var method = (r.method || 'ALL').toUpperCase();
        if (r.path instanceof RegExp) {
            return { method: method, fallback: true };
        }
        var path = r.path || '';
        // Check for Regex special chars (excluding * and :) which implies manual Fallback handling
        // Standard Express chars: ( ) { } ? + *
        // We treat * and : as "Radix Supported", others as "Fallback"
        if (!path || /[(){}\\^$|+?]/.test(path)) {
            return { method: method, fallback: true };
        }
        // Check for complex segments (partial wildcards or complex params)
        var parts = path.split('/');
        try {
            for (var parts_1 = tslib_1.__values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                var p = parts_1_1.value;
                if (p === '' || p === '.' || p === '..')
                    continue;
                // 1. Partial Wildcards (e.g. ab*cd)
                if (p.includes('*') && p !== '*' && p !== '**') {
                    return { method: method, fallback: true };
                }
                // 2. Complex Params (e.g. :from-:to or :id(\d+))
                if (p.startsWith(':')) {
                    // Valid simple param: :id
                    // Invalid/Complex: :id-name, :id(\d+), :a.:b
                    // We allow simple alphanumeric + underscore
                    if (!/^:[a-zA-Z0-9_]+$/.test(p)) {
                        return { method: method, fallback: true };
                    }
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
        return { method: method, path: path, fallback: false };
    };
    // Dummy helper to ignore unused var warning if any
    RouteMatcher.ignore = function (v) { };
    RouteMatcher.compile = function (route) {
        if (route instanceof RegExp)
            return route;
        if (typeof route !== 'string' && route.path instanceof RegExp)
            return route.path;
        var pathValue = typeof route === 'string' ? route : route.path;
        if (typeof pathValue !== 'string')
            return undefined;
        // Convert Express-style string to RegExp
        var pattern = pathValue
            // Escape dots
            .replace(/\./g, '\\.')
            // Handle ** (deep wildcard) -> .*
            .replace(/\*\*/g, '.*')
            // Handle * (wildcard) -> .* 
            .replace(/(?<!\.)\*/g, '.*');
        // Handle :param(regex) and :param
        // Regex for :param is /:([a-zA-Z0-9_]+)(\((?:[^()]+)*\))?/g
        // We need to loop to handle constraints properly
        // We must be careful not to corrupt the string while replacing. 
        // But since we process left-to-right, .replace is fine.
        pattern = pattern.replace(/:([a-zA-Z0-9_]+)(\((?:[^()]+)*\))?/g, function (match, param, constraint) {
            if (constraint) {
                var inner = constraint.slice(1, -1);
                return "(?<".concat(param, ">").concat(inner, ")");
            }
            return "(?<".concat(param, ">[^/]+?)");
        });
        // Ensure start/end matching
        if (!pattern.startsWith('^'))
            pattern = '^' + pattern;
        if (!pattern.endsWith('$'))
            pattern = pattern + '$';
        console.log("DEBUG_COMPILE: ".concat(pathValue, " -> ").concat(pattern));
        try {
            return new RegExp(pattern);
        }
        catch (_a) {
            return undefined; // Invalid pattern fallback
        }
    };
    RouteMatcher.matchPathLogic = function (pattern, routePath) {
        if (pattern === '*' || pattern === '**')
            return true;
        if (pattern === routePath)
            return true;
        if (pattern.endsWith('/**')) {
            var prefix = pattern.slice(0, -3);
            return routePath.startsWith(prefix);
        }
        if (pattern.endsWith('/*')) {
            var prefix = pattern.slice(0, -2);
            if (!routePath.startsWith(prefix))
                return false;
            var rest = routePath.slice(prefix.length);
            return rest.startsWith('/') || rest === '';
        }
        return false;
    };
    return RouteMatcher;
}());
exports.RouteMatcher = RouteMatcher;