export class RouteMatcher {
    static normalize(def) {
        if (typeof def === 'string')
            return { method: 'ALL', path: def };
        if (def instanceof RegExp)
            return { method: 'ALL', path: def };
        return {
            method: (def.method || 'ALL').toUpperCase(),
            path: def.path
        };
    }
    static isMatch(routeDef, reqMethod, reqPath) {
        if (routeDef instanceof RegExp)
            return routeDef.test(reqPath);
        if (typeof routeDef === 'string')
            return this.matchPathLogic(routeDef, reqPath);
        const method = (routeDef.method || 'ALL').toUpperCase();
        if (method !== 'ALL' && method !== reqMethod)
            return false;
        if (routeDef.path instanceof RegExp) {
            return routeDef.path.test(reqPath);
        }
        if (typeof routeDef.path === 'string') {
            return this.matchPathLogic(routeDef.path, reqPath);
        }
        return true;
    }
    static analyze(route) {
        if (route instanceof RegExp)
            return { method: 'ALL', fallback: true };
        const r = typeof route === 'string' ? { path: route, method: 'ALL' } : route;
        const method = (r.method || 'ALL').toUpperCase();
        if (r.path instanceof RegExp) {
            return { method, fallback: true };
        }
        const path = r.path || '';
        // Check for Regex special chars (excluding * and :) which implies manual Fallback handling
        // Standard Express chars: ( ) { } ? + *
        // We treat * and : as "Radix Supported", others as "Fallback"
        if (!path || /[(){}\\^$|+?]/.test(path)) {
            return { method, fallback: true };
        }
        // Check for complex segments (partial wildcards or complex params)
        const parts = path.split('/');
        for (const p of parts) {
            if (p === '' || p === '.' || p === '..')
                continue;
            // 1. Partial Wildcards (e.g. ab*cd)
            if (p.includes('*') && p !== '*' && p !== '**') {
                return { method, fallback: true };
            }
            // 2. Complex Params (e.g. :from-:to or :id(\d+))
            if (p.startsWith(':')) {
                // Valid simple param: :id
                // Invalid/Complex: :id-name, :id(\d+), :a.:b
                // We allow simple alphanumeric + underscore
                if (!/^:[a-zA-Z0-9_]+$/.test(p)) {
                    return { method, fallback: true };
                }
            }
        }
        return { method, path, fallback: false };
    }
    // Dummy helper to ignore unused var warning if any
    static ignore(v) { }
    static compile(route) {
        if (route instanceof RegExp)
            return route;
        if (typeof route !== 'string' && route.path instanceof RegExp)
            return route.path;
        const pathValue = typeof route === 'string' ? route : route.path;
        if (typeof pathValue !== 'string')
            return undefined;
        // Convert Express-style string to RegExp
        let pattern = pathValue
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
        pattern = pattern.replace(/:([a-zA-Z0-9_]+)(\((?:[^()]+)*\))?/g, (match, param, constraint) => {
            if (constraint) {
                const inner = constraint.slice(1, -1);
                return `(?<${param}>${inner})`;
            }
            return `(?<${param}>[^/]+?)`;
        });
        // Ensure start/end matching
        if (!pattern.startsWith('^'))
            pattern = '^' + pattern;
        if (!pattern.endsWith('$'))
            pattern = pattern + '$';
        console.log(`DEBUG_COMPILE: ${pathValue} -> ${pattern}`);
        try {
            return new RegExp(pattern);
        }
        catch (_a) {
            return undefined; // Invalid pattern fallback
        }
    }
    static matchPathLogic(pattern, routePath) {
        if (pattern === '*' || pattern === '**')
            return true;
        if (pattern === routePath)
            return true;
        if (pattern.endsWith('/**')) {
            const prefix = pattern.slice(0, -3);
            return routePath.startsWith(prefix);
        }
        if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            if (!routePath.startsWith(prefix))
                return false;
            const rest = routePath.slice(prefix.length);
            return rest.startsWith('/') || rest === '';
        }
        return false;
    }
}