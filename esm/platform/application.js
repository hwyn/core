import { __awaiter, __decorate } from "tslib";
/* eslint-disable no-await-in-loop */
import { resolveMinimal, InjectFlags, Injectable, InstantiationPolicy } from '@hwy-fm/di';
import { APPLICATION_PLUGIN } from "../token/index.js";
import { cloneDeepPlain, sortByOrder, isPlainObject } from "../utility/index.js";
let ApplicationContext = class ApplicationContext {
    resolveMetadata(injector, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isPlainObject(metadata))
                return cloneDeepPlain(metadata);
            const [instance, destroy] = resolveMinimal(metadata, injector);
            try {
                return cloneDeepPlain(yield instance.load());
            }
            finally {
                yield destroy();
            }
        });
    }
    getApp(injector, app) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const plugins = sortByOrder(injector.get(APPLICATION_PLUGIN, InjectFlags.Optional) || []);
            (_b = (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.log) === null || _b === void 0 ? void 0 : _b.call(_a, `[Platform] Initializing application with ${plugins.length} plugins...`);
            for (const plugin of plugins)
                yield plugin.register();
            (_d = (_c = InstantiationPolicy.logger) === null || _c === void 0 ? void 0 : _c.log) === null || _d === void 0 ? void 0 : _d.call(_c, `[Platform] Application initialized successfully.`);
            return injector.get(app);
        });
    }
};
ApplicationContext = __decorate([
    Injectable()
], ApplicationContext);
export { ApplicationContext };