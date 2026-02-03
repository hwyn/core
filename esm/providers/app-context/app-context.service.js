var _a;
import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injector, InjectorToken } from '@hwy-fm/di';
export const APP_CONTEXT = InjectorToken.get('APP_CONTEXT');
let AppContextService = class AppContextService {
    constructor(injector) {
        this.injector = injector;
    }
    getContext() {
        return this.injector.get(APP_CONTEXT) || {};
    }
    get fetch() {
        return this.getContext().fetch;
    }
    get isMicro() {
        return this.getContext().isMicro;
    }
    get microManage() {
        return this.getContext().useMicroManage();
    }
};
AppContextService = __decorate([
    __param(0, Inject(Injector)),
    __metadata("design:paramtypes", [typeof (_a = typeof Injector !== "undefined" && Injector) === "function" ? _a : Object])
], AppContextService);
export { AppContextService };