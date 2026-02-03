export function isPlainObject(val) {
    return !!val && typeof val === 'object' && (Object.getPrototypeOf(val) === null || Object.getPrototypeOf(val) === Object.prototype);
}
export function getValue(source, path) {
    if (source == null || !path)
        return undefined;
    const keys = path.replace(/\[/g, '.').replace(/['"\]]/g, '').split('.').filter(Boolean);
    return keys.reduce((obj, key) => (obj == null ? undefined : obj[key]), source);
}
export function cloneDeepPlain(value) {
    if (value === null || typeof value !== 'object')
        return value;
    if (Array.isArray(value))
        return value.map(item => cloneDeepPlain(item));
    if (!isPlainObject(value))
        return value;
    const result = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            result[key] = cloneDeepPlain(value[key]);
        }
    }
    return result;
}
export function sortByOrder(types) {
    const getOrder = (type) => {
        var _a, _b;
        if (typeof type === 'function')
            return (_a = type.__order__) !== null && _a !== void 0 ? _a : 0;
        return (_b = Object.getPrototypeOf(type).constructor.__order__) !== null && _b !== void 0 ? _b : 0;
    };
    return types.sort((pre, next) => getOrder(pre) - getOrder(next));
}