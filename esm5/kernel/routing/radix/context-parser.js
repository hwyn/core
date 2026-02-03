export function parseContextUrl(context) {
    var method = (context.identify.method || 'GET').toUpperCase();
    var path = (context.identify.path || '/');
    var queryIndex = path.indexOf('?');
    var hashIndex = path.indexOf('#');
    // Logic to handle both standard (/path?q=1#hash) and inverted (/path#hash?q=1) orders
    var queryStr = '';
    var hashStr = '';
    // Case A: Query appears first (or only query)
    if (queryIndex !== -1 && (hashIndex === -1 || queryIndex < hashIndex)) {
        // /... ? ... # ...
        if (hashIndex !== -1) {
            queryStr = path.substring(queryIndex + 1, hashIndex);
            hashStr = path.substring(hashIndex);
            path = path.substring(0, queryIndex);
        }
        else {
            queryStr = path.substring(queryIndex + 1);
            path = path.substring(0, queryIndex);
        }
    }
    // Case B: Hash appears first (Inverted support)
    else if (hashIndex !== -1) {
        // /... # ... ? ...
        // Note: Standard spec says ? is part of hash here. We "fix" it for flexibility.
        if (queryIndex !== -1) {
            hashStr = path.substring(hashIndex, queryIndex);
            queryStr = path.substring(queryIndex + 1);
            path = path.substring(0, hashIndex);
        }
        else {
            hashStr = path.substring(hashIndex);
            path = path.substring(0, hashIndex);
        }
    }
    // Assign Findings
    if (hashStr && !context.identify.hash) {
        context.identify.hash = hashStr;
    }
    if (queryStr && !context.identify.query) {
        var query_1 = {};
        queryStr.split('&').forEach(function (part) {
            var eqIdx = part.indexOf('=');
            var key;
            var val;
            if (eqIdx === -1) {
                key = part;
                val = '';
            }
            else {
                key = part.substring(0, eqIdx);
                val = part.substring(eqIdx + 1);
            }
            if (key) {
                try {
                    var decodedKey = decodeURIComponent(key);
                    var decodedVal = val ? decodeURIComponent(val) : '';
                    query_1[decodedKey] = decodedVal;
                }
                catch (e) {
                    // Ignore malformed URI components
                }
            }
        });
        context.identify.query = query_1;
    }
    return { method: method, path: path };
}