# @hwy-fm/core
> **The Isomorphic Foundation for Modern TypeScript Applications**

**@hwy-fm/core** is the shared bedrock that powers both Server-Side (Node.js) and Client-Side (SPA/Micro-Frontend) applications. It provides the unified system for Dependency Injection, Platform Abstraction, and Logic Orchestration.

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