"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelLoader = void 0;
var tslib_1 = require("tslib");
var di_1 = require("@hwy-fm/di");
var compiler_1 = require("../compiler");
var policy_1 = require("../policy");
var registry_1 = require("../registry/registry");
var aggregate_1 = require("../routing/aggregate");
var strategy_1 = require("../routing/strategy");
var types_1 = require("../types");
function getPathLength(route) {
    if (typeof route === 'string')
        return route.length;
    if (route && typeof route.path === 'string')
        return route.path.length;
    return 0;
}
var KernelLoader = /** @class */ (function () {
    function KernelLoader(compiler, injector, registry, router) {
        this.compiler = compiler;
        this.injector = injector;
        this.registry = registry;
        this.router = router;
        this.compiledSeeds = new Set();
    }
    KernelLoader.prototype.bootstrap = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rawDescriptors, seedDescriptors, startDes, startSeed;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rawDescriptors = this.injector.get(types_1.INSTRUCTION_QUEUE, di_1.InjectFlags.Optional) || [];
                        seedDescriptors = this.injector.get(types_1.SEED_TOKEN, di_1.InjectFlags.Optional) || [];
                        if (rawDescriptors.length > 0) {
                            startDes = Date.now();
                            this.registry.registerInstructions(rawDescriptors);
                            policy_1.KernelPolicy.logger.log("[KernelLoader] Registered ".concat(rawDescriptors.length, " instructions in ").concat(Date.now() - startDes, "ms"));
                        }
                        if (seedDescriptors.length > 0) {
                            startSeed = Date.now();
                            this.registry.registerSeeds(seedDescriptors);
                            policy_1.KernelPolicy.logger.log("[KernelLoader] Registered ".concat(seedDescriptors.length, " seeds in ").concat(Date.now() - startSeed, "ms"));
                        }
                        return [4 /*yield*/, this.mount()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KernelLoader.prototype.mount = function () {
        return tslib_1.__awaiter(this, arguments, void 0, function (seeds) {
            var newSeeds, candidates, toCompile, plans, i, seed;
            var _this = this;
            if (seeds === void 0) { seeds = []; }
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newSeeds = seeds.filter(function (s) { return !_this.compiledSeeds.has(s); });
                        if (newSeeds.length > 0) {
                            this.registry.registerSeeds(newSeeds);
                        }
                        if (seeds.length > 0) {
                            candidates = seeds.sort(this.sortByPath);
                        }
                        else {
                            candidates = tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(this.registry.getProcessSeeds().sort(this.sortByPath)), false), tslib_1.__read(this.registry.getIngressSeeds().sort(this.sortByPath)), false);
                        }
                        toCompile = candidates.filter(function (s) { return !_this.compiledSeeds.has(s); });
                        if (toCompile.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(toCompile.map(function (seed) { return _this.compiler.buildPlan(seed, _this.injector); }))];
                    case 1:
                        plans = _a.sent();
                        for (i = 0; i < plans.length; i++) {
                            seed = toCompile[i];
                            this.router.add(seed.route, plans[i].runner, seed.strategy);
                            this.compiledSeeds.add(seed);
                        }
                        policy_1.KernelPolicy.logger.log("[KernelLoader] Compiled and mounted ".concat(plans.length, " pipelines."));
                        return [2 /*return*/];
                }
            });
        });
    };
    KernelLoader.prototype.sortByPath = function (a, b) {
        return getPathLength(b.route) - getPathLength(a.route);
    };
    var _a, _b, _c, _d;
    KernelLoader = tslib_1.__decorate([
        (0, di_1.Injectable)(),
        tslib_1.__param(3, (0, di_1.Inject)(strategy_1.ROUTE_STRATEGY)),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof compiler_1.KernelCompiler !== "undefined" && compiler_1.KernelCompiler) === "function" ? _a : Object, typeof (_b = typeof di_1.Injector !== "undefined" && di_1.Injector) === "function" ? _b : Object, typeof (_c = typeof registry_1.Registry !== "undefined" && registry_1.Registry) === "function" ? _c : Object, typeof (_d = typeof aggregate_1.AggregateRouterStrategy !== "undefined" && aggregate_1.AggregateRouterStrategy) === "function" ? _d : Object])
    ], KernelLoader);
    return KernelLoader;
}());
exports.KernelLoader = KernelLoader;