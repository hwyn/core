import { InjectorToken } from '@hwy-fm/di';
import { SeedInstruction } from '../types';
import { ExecutableSeed } from '../types/seed-contract';
import { StrategyToken } from '../routing/strategy';
export declare const registerSeed: (loader: SeedInstruction) => void;
export interface SeedFactoryOptions {
    slot: string;
    aggregation: SeedInstruction['aggregation'];
    profile?: string;
    protocol: symbol | object | InjectorToken;
    strategy?: StrategyToken;
}
export interface ExecutableClassDecorator {
    <T extends {
        new (...args: any[]): ExecutableSeed;
    }>(target: T): void | T;
}
export type SeedDecorator = ExecutableClassDecorator & MethodDecorator;
/**
 * Creates a decorator factory for Seed instructions that supports both **Class** and **Method** usage.
 *
 * A Seed instruction acts as the starting point or context boundary for a Pipeline.
 *
 * **1. Class Decorator Mode (New Standard):**
 * - Use this when the entire Class represents a business unit.
 * - **Requirements**: The class MUST implement the `ExecutableSeed` interface (i.e., contain an `execute(ctx)` method).
 * - **Feature**: Automatically marks the class as `@Injectable`.
 *
 * **2. Method Decorator Mode (Legacy Support):**
 * - Use this to expose a specific method within a Container as a Seed.
 * - Does not enforce strict interfaces but requires the container to be registered in DI.
 *
 * **Routing & Registration Behavior:**
 * If the resulting metadata does NOT contain a `route`:
 * 1. For `PROCESS_DEF` aggregation: It throws an error, as business processes require a route.
 * 2. For others (e.g., `INGRESS_ONLY`): It **downgrades** to a standard instruction registration (`registerInstruction`).
 *    This means it will NOT be collected as a standalone Seed (under `SEED_TOKEN`) and cannot initiate a pipeline on its own;
 *    instead, it will be treated as a regular instruction attached to the host.
 *
 * @param options Configuration options for the seed factory
 * @param props Adapter function to transform arguments into Seed metadata
 */
export declare function createSeedDecorator<T extends any[] = any[]>(options: SeedFactoryOptions, props?: (...args: T) => Partial<SeedInstruction>): (...args: T) => SeedDecorator;
