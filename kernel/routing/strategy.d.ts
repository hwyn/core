import { InjectorToken, Type } from '@hwy-fm/di';
import { PipelineRunner } from '../compiler/ast/plan';
import { Context, RouteDef } from '../types';
export declare const ROUTE_STRATEGY: InjectorToken;
export declare const ROUTE_MATCHER: InjectorToken;
export declare const HTTP_PROTOCOL: InjectorToken;
export type StrategyToken = Type<RouteStrategy> | InjectorToken;
export interface RouteMatchResult {
    params?: Record<string, string>;
    runner: PipelineRunner;
}
export interface RouteStrategy {
    add(route: RouteDef, runner: PipelineRunner): void;
    check(route: RouteDef, context: Context): boolean;
    contains(pattern: RouteDef, target: RouteDef): boolean;
    match(context: Context): RouteMatchResult | undefined;
}
