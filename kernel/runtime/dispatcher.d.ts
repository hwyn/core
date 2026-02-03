import { Context } from '../types';
import { AggregateRouterStrategy } from '../routing/aggregate';
import { StrategyToken } from '../routing/strategy';
import { RuntimePipelineUtils } from './pipeline.utils';
import { KernelEventBus } from '../event';
export declare class KernelDispatcher {
    private readonly router;
    private readonly pipelineUtils;
    private readonly bus;
    private activeRequests;
    private shuttingDown;
    private shutdownResolvers;
    constructor(router: AggregateRouterStrategy, pipelineUtils: RuntimePipelineUtils, bus: KernelEventBus);
    shutdown(timeout?: number): Promise<void>;
    dispatch(context: Context, strategyToken?: StrategyToken, next?: () => Promise<any>): Promise<any>;
    private checkAvailability;
    private prepareContext;
    private monitorExecution;
    private finalizeRequest;
    private ensureSignal;
}
