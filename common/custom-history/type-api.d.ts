import { Observable } from 'rxjs';
export type RouteItem = {
    canActivate?: CanActivate[];
    resolve?: {
        [key: string]: any;
    };
    loadModule?: () => Promise<any>;
    key?: string;
    path: string;
    component: any;
    props: {
        [key: string]: any;
    };
};
export interface RouteInfo {
    path: string | null;
    list: RouteItem[];
    query: {
        [key: string]: any;
    };
    params: {
        [key: string]: any;
    };
}
export declare interface CanActivate {
    canActivate(routeInfo: RouteInfo, routeItem: RouteItem): Observable<boolean> | Promise<boolean> | boolean;
}
export declare interface Resolve<T = any> {
    resolve(routeInfo: RouteInfo, routeItem: RouteItem): Observable<T> | Promise<T> | T;
}
export declare type ResolveData = {
    [name: string]: any;
};
