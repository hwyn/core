import { __awaiter, __decorate, __generator, __metadata } from "tslib";
import { Injector, InjectorToken, INJECTOR_SCOPE, ROOT_SCOPE, InjectFlags, Injectable } from '@hwy-fm/di';
import { createSeedDecorator } from "./decorator/seed.js";
import { SEED_TOKEN } from "./types/index.js";
import { Registry } from "./registry/registry.js";
// Mock Protocol
var MOCK_PROTOCOL = new InjectorToken('MOCK_PROTOCOL');
// Define the Decorator
var MockSeed = createSeedDecorator({
    slot: 'MockSlot',
    aggregation: 'PROCESS_DEF',
    protocol: MOCK_PROTOCOL,
    profile: 'test-profile'
}, function (path) { return ({ route: path }); });
// -------------------------------------------------------------
// 1. Definition Phase (The "Attractive" Part)
// -------------------------------------------------------------
// A Service to demonstrate Dependency Injection
var UserService = /** @class */ (function () {
    function UserService() {
    }
    UserService.prototype.getUser = function (id) { return "User<".concat(id, ">"); };
    UserService = __decorate([
        Injectable()
    ], UserService);
    return UserService;
}());
// Case A: The New Standard (Class-Based Seed)
// Notice: No @Injectable() needed! It's auto-applied.
var UserProfileSeed = /** @class */ (function () {
    // Dependencies are auto-injected
    function UserProfileSeed(userService) {
        this.userService = userService;
    }
    UserProfileSeed.prototype.execute = function (ctx) {
        var user = this.userService.getUser('42');
        return "UserProfile Loaded: ".concat(user, " (Path: ").concat(ctx.path, ")");
    };
    UserProfileSeed = __decorate([
        MockSeed('/users/profile'),
        __metadata("design:paramtypes", [UserService])
    ], UserProfileSeed);
    return UserProfileSeed;
}());
// Case B: Legacy Support (Method-Based)
var LegacyController = /** @class */ (function () {
    function LegacyController() {
    }
    LegacyController.prototype.oldSchoolHandler = function (ctx) {
        return "Legacy Method Executed! path=".concat(ctx.path);
    };
    __decorate([
        MockSeed('/legacy-method'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], LegacyController.prototype, "oldSchoolHandler", null);
    return LegacyController;
}());
// Case C: Validation Check
try {
    // @ts-ignore - Demonstrating runtime validation
    var BadSeed = /** @class */ (function () {
        function BadSeed() {
        }
        BadSeed = __decorate([
            MockSeed('/invalid-class')
        ], BadSeed);
        return BadSeed;
    }());
}
catch (e) {
    console.log('✅ Validation Check Passed:', e.message);
}
// -------------------------------------------------------------
// 2. Dispatch/Runtime Phase
// -------------------------------------------------------------
function runKernelDispatch() {
    return __awaiter(this, void 0, void 0, function () {
        // 3. Dispatcher Simulation
        function dispatch(url, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var seeds, match, hostInstance, methodToCall, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("\n\uD83D\uDE80 Dispatching: ".concat(url));
                            seeds = registry.getProcessSeeds(MOCK_PROTOCOL);
                            match = seeds.find(function (s) { return s.route === url; });
                            if (!match) {
                                console.warn("\u26A0\uFE0F  404 Not Found: ".concat(url));
                                return [2 /*return*/];
                            }
                            hostInstance = injector.get(match.hostClass);
                            methodToCall = match.propertyKey;
                            console.log("   \uD83D\uDC49 Targeted: ".concat(match.hostClass.name, ".").concat(methodToCall, "()"));
                            return [4 /*yield*/, hostInstance[methodToCall](ctx)];
                        case 1:
                            result = _a.sent();
                            console.log("   \uD83C\uDFC1 Result: \"".concat(result, "\""));
                            return [2 /*return*/];
                    }
                });
            });
        }
        var injector, registry, registeredSeeds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n--- Booting Kernel Runtime ---');
                    injector = Injector.create([
                        { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE },
                        UserService, // Register the service
                        UserProfileSeed, // Register the Seed (Auto-Injectable makes this valid)
                        LegacyController // Register the Legacy container
                    ]);
                    registry = new Registry();
                    registeredSeeds = injector.get(SEED_TOKEN, InjectFlags.Optional) || [];
                    console.log("\uD83D\uDCE6 Loaded ".concat(registeredSeeds.length, " seeds from Global Scope."));
                    registry.registerSeeds(registeredSeeds);
                    // 4. Test Runs
                    return [4 /*yield*/, dispatch('/users/profile', { path: '/users/profile' })];
                case 1:
                    // 4. Test Runs
                    _a.sent();
                    return [4 /*yield*/, dispatch('/legacy-method', { path: '/legacy-method' })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
runKernelDispatch();