var _a, _b, _c, _d;
import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Inject, InjectFlags, Injectable, Injector } from '@hwy-fm/di';
import { KernelCompiler } from "../compiler/index.js";
import { KernelPolicy } from "../policy/index.js";
import { Registry } from "../registry/registry.js";
import { AggregateRouterStrategy } from "../routing/aggregate.js";
import { ROUTE_STRATEGY } from "../routing/strategy.js";
import { INSTRUCTION_QUEUE, SEED_TOKEN } from "../types/index.js";
function getPathLength(route) {
    if (typeof route === 'string')
        return route.length;
    if (route && typeof route.path === 'string')
        return route.path.length;
    return 0;
}
let KernelLoader = class KernelLoader {
    constructor(compiler, injector, registry, router) {
        this.compiler = compiler;
        this.injector = injector;
        this.registry = registry;
        this.router = router;
        this.compiledSeeds = new Set();
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawDescriptors = this.injector.get(INSTRUCTION_QUEUE, InjectFlags.Optional) || [];
            const seedDescriptors = this.injector.get(SEED_TOKEN, InjectFlags.Optional) || [];
            if (rawDescriptors.length > 0) {
                const startDes = Date.now();
                this.registry.registerInstructions(rawDescriptors);
                KernelPolicy.logger.log(`[KernelLoader] Registered ${rawDescriptors.length} instructions in ${Date.now() - startDes}ms`);
            }
            if (seedDescriptors.length > 0) {
                const startSeed = Date.now();
                this.registry.registerSeeds(seedDescriptors);
                KernelPolicy.logger.log(`[KernelLoader] Registered ${seedDescriptors.length} seeds in ${Date.now() - startSeed}ms`);
            }
            yield this.mount();
        });
    }
    mount() {
        return __awaiter(this, arguments, void 0, function* (seeds = []) {
            const newSeeds = seeds.filter(s => !this.compiledSeeds.has(s));
            if (newSeeds.length > 0) {
                this.registry.registerSeeds(newSeeds);
            }
            let candidates;
            if (seeds.length > 0) {
                candidates = seeds.sort(this.sortByPath);
            }
            else {
                candidates = [
                    ...this.registry.getProcessSeeds().sort(this.sortByPath),
                    ...this.registry.getIngressSeeds().sort(this.sortByPath)
                ];
            }
            const toCompile = candidates.filter(s => !this.compiledSeeds.has(s));
            if (toCompile.length === 0) {
                return;
            }
            const plans = yield Promise.all(toCompile.map(seed => this.compiler.buildPlan(seed, this.injector)));
            for (let i = 0; i < plans.length; i++) {
                const seed = toCompile[i];
                this.router.add(seed.route, plans[i].runner, seed.strategy);
                this.compiledSeeds.add(seed);
            }
            KernelPolicy.logger.log(`[KernelLoader] Compiled and mounted ${plans.length} pipelines.`);
        });
    }
    sortByPath(a, b) {
        return getPathLength(b.route) - getPathLength(a.route);
    }
};
KernelLoader = __decorate([
    Injectable(),
    __param(3, Inject(ROUTE_STRATEGY)),
    __metadata("design:paramtypes", [typeof (_a = typeof KernelCompiler !== "undefined" && KernelCompiler) === "function" ? _a : Object, typeof (_b = typeof Injector !== "undefined" && Injector) === "function" ? _b : Object, typeof (_c = typeof Registry !== "undefined" && Registry) === "function" ? _c : Object, typeof (_d = typeof AggregateRouterStrategy !== "undefined" && AggregateRouterStrategy) === "function" ? _d : Object])
], KernelLoader);
export { KernelLoader };