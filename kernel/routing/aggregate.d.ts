import { Injector } from '@hwy-fm/di';
import { RouteMatchResult, StrategyToken } from './strategy';
import { Context, RouteDef } from '../types';
import { PipelineRunner } from '../compiler/ast/plan';
export declare class AggregateRouterStrategy {
    private injector;
    constructor(injector: Injector);
    add(route: RouteDef, runner: PipelineRunner, strategyToken?: StrategyToken): void;
    check(route: RouteDef, context: Context, strategyToken?: StrategyToken): boolean;
    contains(pattern: RouteDef, target: RouteDef, strategyToken?: StrategyToken): boolean;
    match(context: Context, strategyToken?: StrategyToken): RouteMatchResult | undefined;
    private dispatch;
}
