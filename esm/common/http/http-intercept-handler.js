export class HttpInterceptHandler {
    constructor(next, interceptor) {
        this.next = next;
        this.interceptor = interceptor;
    }
    handle(req, params) {
        return this.interceptor.intercept(req, params, this.next);
    }
}