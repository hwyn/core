"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpInterceptHandler = void 0;
var HttpInterceptHandler = /** @class */ (function () {
    function HttpInterceptHandler(next, interceptor) {
        this.next = next;
        this.interceptor = interceptor;
    }
    HttpInterceptHandler.prototype.handle = function (req, params) {
        return this.interceptor.intercept(req, params, this.next);
    };
    return HttpInterceptHandler;
}());
exports.HttpInterceptHandler = HttpInterceptHandler;