import { Type, InjectorToken } from '@hwy-fm/di';
import { PipelineRunner } from '../compiler/ast/plan';
import { Context, RouteDef } from '../types';
import { RouteStrategy } from './strategy';
import { AggregateRouterStrategy } from './aggregate';
export declare class KernelRouter {
    private strategy?;
    constructor(strategy?: AggregateRouterStrategy);
    add(route: RouteDef, runner: PipelineRunner, strategyToken?: Type<RouteStrategy> | InjectorToken): void;
    match(context: Context, strategyToken?: Type<RouteStrategy> | InjectorToken): PipelineRunner | undefined;
    setStrategy(strategy: AggregateRouterStrategy): void;
}
