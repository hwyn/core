# @hwy-fm/core
> **The Isomorphic Foundation for Modern TypeScript Applications**

**@hwy-fm/core** is the shared bedrock that powers both Server-Side (Node.js) and Client-Side (SPA/Micro-Frontend) applications. It provides the unified system for Dependency Injection, Platform Abstraction, and Logic Orchestration.

---

## ⚡️ The Core Difference
Most frameworks force you to write "Controllers" (Methods) and manually wire middleware.
**@hwy-fm/core** compiles your business logic into a governed **Pipeline**.

```typescript
// Define a clean, independent "Seed" (Logic Unit)
// 1. Fully typed. 2. Auto-Injected. 3. Pipeline Governed.
@HttpUserSeed('/profile/me')
export class UserProfileSeed implements ExecutableSeed {

  // ✅ Auto-Injection: Just declare what you need
  constructor(private service: UserService) {}

  // ✅ Declarative Pipeline: Order is governed by the Architecture, not by line numbers
  @Auth('jwt')   // RUNS FIRST (Ingress protection)
  @Log('audit')  // RUNS SECOND (Before Execution)
  execute(ctx: Context) {
    return this.service.getProfile(ctx.userId);
  }
}
```

---

## 💎 Philosophy

### 1. Compiler, Over Interpreter
Most frameworks resolve middleware chains dynamically for every request, burning CPU cycles on recursive calls and context switching.
**@hwy-fm/core Kernel compiles your logic at startup.** It turns complex decorator chains into a single, flattened, high-performance closure. **Zero runtime reflection. Zero dynamic lookup during requests.**

### 2. Governance by Architecture
Stop relying on implicit code order. In traditional frameworks, placing `@Auth` below `@Log` might break your security auditing.
In @hwy-fm/core, execution order is dictated by **Slots** (e.g., `INGRESS` -> `PROCESS`). The framework enforces your "Constitution", making it structurally impossible for junior developers to bypass security or validation layers.

### 3. True Isomorphism
Not just "Node.js code that might run in a browser with polyfills".
@hwy-fm/core is designed from the ground up to be environment-agnostic. Use the same DI container, the same Bootstrap lifecycle, and the same Logic Pipeline on your **Node.js Microservices**, **React/Vue Clients**, **Electron Apps**, and **Edge Workers**.

---

## 🏛 Architecture Overview

The framework is built on three distinct layers. Code in "Core" is environment-agnostic.

| Layer | Component | Responsibility |
| :--- | :--- | :--- |
| **1. The Shell** | **Platform** | Bootstrapping, Environment Adapters, Root Injector. |
| **2. The Engine** | **Kernel** | Business Logic Orchestration, Pipeline Compilation. |
| **3. The Features** | **Plugins** | Modular capabilities (HTTP, Database, State Management). |

---

# Part I: The Platform (Runtime)

The Platform Layer is responsible for starting the application, managing the lifecycle, and providing the Dependency Injection context.

## 1. Bootstrapping Sequence
When the platform requests the application instance (via `APPLICATION_TOKEN`), the following **Atomic Execution Flow** occurs inside the core:

1.  **Metadata Resolution**:
    *   The `APPLICATION_METADATA` is resolved. If a Class was passed, it is instantiated and its `load()` method is executed (useful for remote config).
2.  **Plugin Initialization**:
    *   All providers registered with `@ApplicationPlugin` are collected and sorted.
    *   The `register()` method of each plugin is executed sequentially.
3.  **Application Instantiation**:
    *   The main application class (decorated with `@Application`) is finally instantiated.
4.  **Lifecycle Execution**:
    *   The platform runtime calls `app.main()` if defined.

## 2. Basic Usage
As a user, you simply define the class. The platform runtime (provided by libraries like `@hwy-fm/express` or `@hwy-fm/csr` or custom ones) handles the rest.

```typescript
import { KernelLoader } from '@hwy-fm/core/kernel';
import { Register } from '@hwy-fm/core/platform';
// The specific @Application decorator is imported from your platform runtime
import { Application } from './my-platform-runtime';

@Register([
  KernelLoader // Register the Logic Engine
])
@Application()
export class MainApplication {
  // The moment this class is evaluated, the application boots up.
}
```

## 3. Plugins: Modular Capability
Plugins are the primary way to extend the framework. They can register providers, configure the Kernel, or hook into the lifecycle.

```typescript
import { ApplicationPlugin, Register, PluginIntercept, Order } from '@hwy-fm/core/platform';

@Order(-100) // Lower numbers run first
@ApplicationPlugin()
@Register([
  { provide: AUTH_SERVICE, useClass: OAuthService }
])
export class AuthPlugin implements PluginIntercept {
  async register() {
    console.log('Auth Plugin Loaded');
  }
}
```

## 4. Building a Custom Platform (Advanced)
If you want to run @hwy-fm/core in a new environment (e.g., Electron, Workers, CLI), you can build your own Platform Adapter layer. This involves creating a Platform Service and a binding decorator using `makeApplication`.

### The `makeApplication` Factory
The `makeApplication` function is the bridge between User Code and Platform Code. It creates a higher-order decorator that:
1.  Accepts configuration (metadata) from the user.
2.  Bootstraps the Dependency Injection container.
3.  Delegates control to your Platform Service.

**Step 1: Define the Platform Service**
This service contains the actual startup logic (e.g., starting an Express server, connecting to a message queue).

```typescript
import { Injectable, Injector } from '@hwy-fm/di';
import { APPLICATION_TOKEN } from '@hwy-fm/core';

@Injectable()
export class CliPlatform {
  constructor(private injector: Injector) {}

  async bootstrap() {
    console.log('CLI Platform Starting...');
    
    // Resolve the Main Application Instance
    // The 'APPLICATION_TOKEN' is automatically provided by the core
    const app = await this.injector.get(APPLICATION_TOKEN);

    // Trigger the Main Lifecycle Method
    if (app.main) await app.main();
  }
}
```

**Step 2: Create the Binder**
Create the specific `@Application` decorator for your platform.

```typescript
import { makeApplication } from '@hwy-fm/core/platform';
import { Injector } from '@hwy-fm/di';
import { CliPlatform } from './index';

export const CliApplication = makeApplication(async (options) => {
  // 1. Create Injector with Core Logic + Platform Service
  // 'options.providers' contains the user's registered providers
  const injector = Injector.create([...options.providers, CliPlatform]);

  // 2. Delegate execution to the Platform Service
  await injector.get(CliPlatform).bootstrap();
});
```

**Step 3: Usage**
Now users can use your platform easily.

```typescript
@Register([...])
@CliApplication()
export class MyTool {}
```

## 5. Application Configuration & Metadata
One of the most powerful features of the Platform layer is how it handles configuration. You can pass simple objects or complex Configuration Classes to the application.

### A. Access via `APPLICATION_METADATA`
You can inject the raw metadata object using the `APPLICATION_METADATA` token.

### B. Dynamic Configuration (Async Load)
Instead of a plain object, you can pass a **Configuration Class**. This class supports Dependency Injection and must implement a `load()` method.

```typescript
import { Injectable, HttpClient } from '@hwy-fm/di';
import { MetadataInfo } from '@hwy-fm/core';

@Injectable()
export class RemoteConfig implements MetadataInfo {
  constructor(private http: HttpClient) {}

  async load() {
    // Dynamically fetch config from a remote server/file
    const config = await this.http.get('/config.json');
    return { ...config, version: '2.0.0' };
  }
}

// Pass the class (not an instance) to the decorator
@CliApplication(RemoteConfig)
export class MyTool {
    // The app waits for RemoteConfig.load() before identifying as "ready"
}
```

### C. Access via `@Input` Decorator
You can extract specific properties from the resolved metadata (whether static or dynamic) directly into your constructor.

```typescript
import { Input } from '@hwy-fm/core';

@CliApplication({
  version: '1.0.0',
  debug: true
})
export class MyTool {
  constructor(
    @Input('version') private version: string, // Injects "1.0.0"
    @Input('debug') private isDebug: boolean   // Injects true
  ) {}

  main() {
    console.log(`Running version ${this.version}`);
  }
}
```

---

# Part II: The Kernel (Logic Engine)

**Stop writing spaghetti middleware.**
The **Kernel** (`@hwy-fm/core/kernel`) is a **Production-Hardened** orchestration engine that fundamentally shifts the cost of logic composition from *Runtime* to *Startup Time*. It now includes advanced shutdown protocols, backpressure handling, and strict topological governance to ensure your specialized logic runs exactly where it should, every single time.

👉 [Deep Dive: The Kernel Architecture & API](./kernel/README.md)

## Core Concepts: The "Zero-Overhead" Engine

### 1. AOT Compilation (Ahead-of-Time)
Traditional frameworks (like Express or Koa) rely on a dynamic "Onion Model", where requests traverse a chain of recursive function calls at runtime. This builds a deep call stack, consumes memory for closures, and wastes CPU cycles resolving the next middleware step.

**The Kernel is different.**
At startup, it analyzes your entire decorator graph. It unwraps the onion, flattens the logic, and compiles it into a **Single Optimized Execution Function**.
*   **Performance**: Middleware overhead becomes effectively zero.
*   **Debugging**: You get clean, flat stack traces instead of 50 layers of framework internals.

### 2. Slot-Based Governance (The "Constitution")
In most frameworks, execution order depends on where you paste the code (`app.use()`). If a developer forgets to add the Auth middleware before the Controller, the route is insecure.

The Kernel uses **Slots** to strictly enforce architectural boundaries. You define *where* logic belongs, and the Kernel guarantees it runs there, regardless of where the decorator is placed.

*   **🛡 INGRESS (The Guard Layer)**:
    *   **Purpose**: Security, Validation, Context Enrichment.
    *   **Guarantee**: Runs *before* any business logic is touched. If an Ingress instruction fails (throws), the pipeline aborts immediately. Nothing else runs.
    *   *Examples: `@Auth`, `@ValidateBody`, `@RateLimit`.*

*   **⚙️ PROCESS (The Seed Layer)**:
    *   **Purpose**: The actual Business Logic.
    *   **Guarantee**: Only executes if all Ingress checks pass. This is where your `@Get` method lives.
    *   *Examples: Data Fetching, Transaction execution.*

*   **📤 EGRESS (The Transform Layer)**:
    *   **Purpose**: Response Formatting, Logging, Error Handling.
    *   **Guarantee**: Runs after the process generates a result.
    *   *Examples: `@Serialize`, `@LogTime`.*

### 3. Self-Healing & Protection
Why write try/catch blocks and timeout handlers in every controller? The Kernel Runtime wraps your compiled pipelines with automatic protection layers.
*   **Timeouts**: Automatically aborts long-running requests to free up resources.
*   **Concurrency Limits**: Prevents a single flood of requests from starving the entire system.
*   **Backpressure**: Intelligently rejects excess load when the system is under stress.

## The Development Workflow

**Defining your architecture is as simple as defining your slots.**

Instead of writing imperative boilerplate for every feature, you simply:

1.  **Define Slots**: Tell the Kernel what "stages" exist in your application (e.g., Auth, Validation, Business Logic).
2.  **Create Decorators**: Map your `@Auth` or `@Get` decorators to those specific slots.
3.  **Compile**: The Kernel generates the execution plan once at startup.

From then on, every feature you write automatically adheres to your architectural rules. No more manual middleware ordering or missing security checks.

👉 [Deep Dive: Implementation Guide & Examples](./kernel/README.md)

### 🔬 Performance & Isolation Verification (Benchmark V2)

In `kernel/stress-test-v2.ts`, we simulate a high-concurrency enterprise mixed-load scenario to verify the kernel's absolute reliability regarding **Multi-Protocol Isolation** and **Topological Governance**.

**Test Scenario:**
- **Mixed Protocols**: 1,000 mixed routes simultaneously handling `HTTP` (Complex Flow), `RPC` (Chain Flow), and `JOB` (Batch Flow).
- **Dynamic Profiles**: Randomized switching between `strict` and `audit` modes, effectively forcing pipeline structure changes (e.g., injecting an Audit Log slot *before* security in audit mode).
- **Zero Core Mocks**: The test runs directly on the REAL Kernel Compiler and DI Container.

**Benchmark Results:**
- **Throughput**: **~310,000 req/s** (Single Thread).
- **Isolation**: 100% Success. HTTP middleware never "leaked" into RPC or JOB execution flows.
- **Governance**: 100% Success. All routes strictly adhered to the Slot order defined by their Protocol.

This proves that even in extremely complex monolithic architectures, developers cannot breach security boundaries through code ordering errors.

---

# Part III: Advanced Patterns

## 🌍 Client-Side Usage (Isomorphic)
You can run the **exact same Feature Seeds** in the browser to handle routing, validation, or data pre-fetching.

**1. The "Logic First" Pattern**
In this architecture, the View is a consequence of State, and State is a consequence of the Kernel Pipeline.

**2. Shared Feature Code**
The code below acts as an API endpoint on the server, AND a Route Guard/Data Fetcher in the browser.

```typescript
// Define Isomorphic Seed for 'User List' Feature
@ViewSeed('/users/list')
class UserListFeature implements ExecutableSeed {
  constructor(private api: ApiService, private store: UserStore) {}

  @Auth({ role: 'admin' })  // Browser: Redirects if not logged in
  @FetchPolicy('cache-first')
  async execute(ctx: Context) {
     const data = await this.api.get('/profile');
     this.store.profile.next(data); // Push to Reactive State
     return 'user-list-view'; // Render this view
  }
}
```

## ⚡️ Power Features

### 1. `@Prov` (Inline Provider Factories)
Short-hand for providers.

```typescript
@Register()
class DatabaseModule {
  @Prov('DB_CONN') 
  connect() { return new Connection(); }
}
```

### 2. Logic Subtraction (`@Attach.Exclude`)
The Kernel allows you to **remove** logic from specific points in the graph.

```typescript
@Auth() // Secure all methods
@Controller({ path: '/api' })
class ApiSeed {
  @Get() // Protected
  profile() {}

  @Attach.Exclude('sys:auth') // Explicitly remove Auth for this method
  @Get()
  publicEndpoint() {}
}
```

---

##  API Reference

### 1. Platform Decorators
Used for bootstrapping and dependency injection. Import from `@hwy-fm/core/platform`.

| Decorator | Target | Description | Example |
| :--- | :--- | :--- | :--- |
| **`@Register(providers[])`** | Class | Registers providers (Classes, Values, Factories) into the dependency injection container. | `@Register([{ provide: API, useValue: 'v1' }])` |
| **`@ApplicationPlugin()`** | Class | Marks a class as a lifecycle plugin. Must implement `PluginIntercept`. | `@ApplicationPlugin() class AuthPlugin {}` |
| **`@Order(n)`** | Class | Defines startup priority for plugins. Lower numbers run first. | `@Order(-1)` |
| **`@Input(key?)`** | Parameter | Injects values from the Application Metadata configuration. | `constructor(@Input('port') port: number)` |
| **`@Prov(token?)`** | Method | Creates a provider from a method return value. Logic runs during bootstrapping. | `@Prov() createClient() { return new Client(); }` |

### 2. Kernel Decorators & Utilities
Used for defining logic and flow. Import from `@hwy-fm/core/kernel`.

| Helper / Decorator | Type | Description |
| :--- | :--- | :--- |
| **`createSeedDecorator(config)`** | Factory | Creates a new entry-point decorator (e.g., `@Get`, `@OnEvent`). Defines which Slot the logic executes in. |
| **`createPipelineDecorator(config)`** | Factory | Creates a new middleware/instruction decorator (e.g., `@Auth`, `@Log`). |
| **`@Attach(slotName, action)`** | Decorator | Manually attaches a pipeline instruction to a method without creating a custom decorator. |
| **`@Attach.Exclude(slotName)`** | Decorator | Removes all instructions belonging to a specific Slot from the current Seed's pipeline. |


---

## 🔬 Reliability & Verification

This core is not just verified by unit tests, but by **Architecture Stress Tests**.
We subject the Kernel to scenarios far exceeding typical enterprise loads to ensure the "Constitution" holds under pressure.

*   **V2 Performance**: 300k req/s throughput with strict Protocol Isolation.
*   **V3 Robustness**: Async/IO latency handling & Error Propagation.
*   **V4 Safety**: Compiler-level rejection of Circular Dependencies and Logical Conflicts.
*   **V5 Dynamism**: Runtime Injection capabilities for self-modifying pipelines.

For full test reports and reproduction scripts, see [kernel/README.md](kernel/README.md).
