import { __awaiter, __decorate, __metadata } from "tslib";
import { Injector, InjectorToken, INJECTOR_SCOPE, ROOT_SCOPE, InjectFlags, Injectable } from '@hwy-fm/di';
import { createSeedDecorator } from "./decorator/seed.js";
import { SEED_TOKEN } from "./types/index.js";
import { Registry } from "./registry/registry.js";
// Mock Protocol
const MOCK_PROTOCOL = new InjectorToken('MOCK_PROTOCOL');
// Define the Decorator
const MockSeed = createSeedDecorator({
    slot: 'MockSlot',
    aggregation: 'PROCESS_DEF',
    protocol: MOCK_PROTOCOL,
    profile: 'test-profile'
}, (path) => ({ route: path }));
// -------------------------------------------------------------
// 1. Definition Phase (The "Attractive" Part)
// -------------------------------------------------------------
// A Service to demonstrate Dependency Injection
let UserService = class UserService {
    getUser(id) { return `User<${id}>`; }
};
UserService = __decorate([
    Injectable()
], UserService);
// Case A: The New Standard (Class-Based Seed)
// Notice: No @Injectable() needed! It's auto-applied.
let UserProfileSeed = class UserProfileSeed {
    // Dependencies are auto-injected
    constructor(userService) {
        this.userService = userService;
    }
    execute(ctx) {
        const user = this.userService.getUser('42');
        return `UserProfile Loaded: ${user} (Path: ${ctx.path})`;
    }
};
UserProfileSeed = __decorate([
    MockSeed('/users/profile'),
    __metadata("design:paramtypes", [UserService])
], UserProfileSeed);
// Case B: Legacy Support (Method-Based)
class LegacyController {
    oldSchoolHandler(ctx) {
        return `Legacy Method Executed! path=${ctx.path}`;
    }
}
__decorate([
    MockSeed('/legacy-method'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LegacyController.prototype, "oldSchoolHandler", null);
// Case C: Validation Check
try {
    // @ts-ignore - Demonstrating runtime validation
    let BadSeed = class BadSeed {
    };
    BadSeed = __decorate([
        MockSeed('/invalid-class')
    ], BadSeed);
}
catch (e) {
    console.log('✅ Validation Check Passed:', e.message);
}
// -------------------------------------------------------------
// 2. Dispatch/Runtime Phase
// -------------------------------------------------------------
function runKernelDispatch() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\n--- Booting Kernel Runtime ---');
        // 1. Create Root Injector
        const injector = Injector.create([
            { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE },
            UserService, // Register the service
            UserProfileSeed, // Register the Seed (Auto-Injectable makes this valid)
            LegacyController // Register the Legacy container
        ]);
        // 2. Initialize Registry & Load Seeds
        const registry = new Registry();
        const registeredSeeds = injector.get(SEED_TOKEN, InjectFlags.Optional) || [];
        console.log(`📦 Loaded ${registeredSeeds.length} seeds from Global Scope.`);
        registry.registerSeeds(registeredSeeds);
        // 3. Dispatcher Simulation
        function dispatch(url, ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`\n🚀 Dispatching: ${url}`);
                const seeds = registry.getProcessSeeds(MOCK_PROTOCOL);
                const match = seeds.find(s => s.route === url);
                if (!match) {
                    console.warn(`⚠️  404 Not Found: ${url}`);
                    return;
                }
                // DI Resolution
                const hostInstance = injector.get(match.hostClass);
                const methodToCall = match.propertyKey;
                console.log(`   👉 Targeted: ${match.hostClass.name}.${methodToCall}()`);
                const result = yield hostInstance[methodToCall](ctx);
                console.log(`   🏁 Result: "${result}"`);
            });
        }
        // 4. Test Runs
        yield dispatch('/users/profile', { path: '/users/profile' });
        yield dispatch('/legacy-method', { path: '/legacy-method' });
    });
}
runKernelDispatch();