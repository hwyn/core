import { RouteDef } from '../../types';
export declare class RouteMatcher {
    static normalize(def: RouteDef): {
        method: string;
        path?: string | RegExp;
    };
    static isMatch(routeDef: RouteDef, reqMethod: string, reqPath: string): boolean;
    static analyze(route: RouteDef): {
        method: string;
        path?: string;
        fallback: boolean;
    };
    private static ignore;
    static compile(route: RouteDef): RegExp | undefined;
    private static matchPathLogic;
}
