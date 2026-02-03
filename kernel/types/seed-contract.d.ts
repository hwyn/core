/**
 * Interface definition for Class-based Seeds.
 *
 * If a class is decorated with `@Seed`, it is highly recommended (and in some configurations required)
 * to implement this interface. This ensures the Kernel knows which method to invoke
 * as the entry point for the business logic.
 *
 * @template TContext The type of the execution context (defaults to any).
 * @template TResult The return type of the execution (defaults to any).
 */
export interface ExecutableSeed<TContext = any, TResult = any> {
    /**
     * The standardized entry point for the Seed.
     *
     * @param context The execution context passed by the Kernel pipeline.
     * @returns The result of the business logic, which will be processed by downstream instructions.
     */
    execute(context: TContext): TResult | Promise<TResult>;
}
/**
 * Token key for the default execution method name.
 * Used by the Registry to unify Class-based and Method-based seeds.
 */
export declare const EXECUTE_METHOD_NAME = "execute";
