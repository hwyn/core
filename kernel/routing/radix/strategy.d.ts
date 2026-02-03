import { PipelineRunner } from '../../compiler/ast/plan';
import { RouteDef, Context } from '../../types';
import { RouteStrategy, RouteMatchResult } from '../strategy';
export declare class RadixRouterStrategy implements RouteStrategy {
    private trees;
    private fallbackRules;
    add(route: RouteDef, runner: PipelineRunner): void;
    match(context: Context): RouteMatchResult | undefined;
    check(route: RouteDef, context: Context): boolean;
    contains(pattern: RouteDef, target: RouteDef): boolean;
    private getTree;
    private createResult;
    private addFallbackRule;
    private matchFallback;
    private isMethodMatch;
    private getRouteKey;
}
