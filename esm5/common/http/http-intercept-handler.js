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
export { HttpInterceptHandler };