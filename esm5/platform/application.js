import { __awaiter, __decorate, __generator, __read, __values } from "tslib";
/* eslint-disable no-await-in-loop */
import { resolveMinimal, InjectFlags, Injectable, InstantiationPolicy } from '@hwy-fm/di';
import { APPLICATION_PLUGIN } from "../token/index.js";
import { cloneDeepPlain, sortByOrder, isPlainObject } from "../utility/index.js";
var ApplicationContext = /** @class */ (function () {
    function ApplicationContext() {
    }
    ApplicationContext.prototype.resolveMetadata = function (injector, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, instance, destroy, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (isPlainObject(metadata))
                            return [2 /*return*/, cloneDeepPlain(metadata)];
                        _a = __read(resolveMinimal(metadata, injector), 2), instance = _a[0], destroy = _a[1];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, , 3, 5]);
                        _b = cloneDeepPlain;
                        return [4 /*yield*/, instance.load()];
                    case 2: return [2 /*return*/, _b.apply(void 0, [_c.sent()])];
                    case 3: return [4 /*yield*/, destroy()];
                    case 4:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ApplicationContext.prototype.getApp = function (injector, app) {
        return __awaiter(this, void 0, void 0, function () {
            var plugins, plugins_1, plugins_1_1, plugin, e_1_1;
            var e_1, _a;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        plugins = sortByOrder(injector.get(APPLICATION_PLUGIN, InjectFlags.Optional) || []);
                        (_c = (_b = InstantiationPolicy.logger) === null || _b === void 0 ? void 0 : _b.log) === null || _c === void 0 ? void 0 : _c.call(_b, "[Platform] Initializing application with ".concat(plugins.length, " plugins..."));
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, 7, 8]);
                        plugins_1 = __values(plugins), plugins_1_1 = plugins_1.next();
                        _f.label = 2;
                    case 2:
                        if (!!plugins_1_1.done) return [3 /*break*/, 5];
                        plugin = plugins_1_1.value;
                        return [4 /*yield*/, plugin.register()];
                    case 3:
                        _f.sent();
                        _f.label = 4;
                    case 4:
                        plugins_1_1 = plugins_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (plugins_1_1 && !plugins_1_1.done && (_a = plugins_1.return)) _a.call(plugins_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        (_e = (_d = InstantiationPolicy.logger) === null || _d === void 0 ? void 0 : _d.log) === null || _e === void 0 ? void 0 : _e.call(_d, "[Platform] Application initialized successfully.");
                        return [2 /*return*/, injector.get(app)];
                }
            });
        });
    };
    ApplicationContext = __decorate([
        Injectable()
    ], ApplicationContext);
    return ApplicationContext;
}());
export { ApplicationContext };