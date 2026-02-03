export const KernelPolicy = {
    applyConfig(config) {
        if (config.debug !== undefined)
            this.debugMode = config.debug;
        if (config.logger !== undefined)
            this.logger = config.logger;
        if (config.timeout !== undefined)
            this.defaultTimeout = config.timeout;
        if (config.concurrency !== undefined)
            this.maxConcurrency = config.concurrency;
    },
    debugMode: false,
    /**
     * Default timeout for pipeline execution in milliseconds.
     * A value of 0 means no timeout (disabled).
     * Default set to 5000ms (5s) for safety.
     */
    defaultTimeout: 0,
    /**
     * Maximum concurrent requests allowed.
     * A value of 0 means no limit.
     */
    maxConcurrency: 0,
    enableDebug(enabled = true) {
        this.debugMode = enabled;
    },
    logger: console
};