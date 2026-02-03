export declare const KernelPolicy: {
    applyConfig(config: {
        debug?: boolean;
        logger?: any;
        timeout?: number;
        concurrency?: number;
    }): void;
    debugMode: boolean;
    /**
     * Default timeout for pipeline execution in milliseconds.
     * A value of 0 means no timeout (disabled).
     * Default set to 5000ms (5s) for safety.
     */
    defaultTimeout: number;
    /**
     * Maximum concurrent requests allowed.
     * A value of 0 means no limit.
     */
    maxConcurrency: number;
    enableDebug(enabled?: boolean): void;
    logger: {
        error: (msg: string, ...args: any[]) => void;
        log: (msg: string, ...args: any[]) => void;
        warn: (msg: string, ...args: any[]) => void;
    };
};
