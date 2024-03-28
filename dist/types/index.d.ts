type RouteHandlerParams = {
    params?: Record<string, string>;
    query?: Record<string, string>;
};
export type GuardFn = (guardParams: RouteHandlerParams) => Promise<void | boolean> | void | boolean;
export type Route = {
    name: string;
    path: `/${string}` | "*";
    target?: string | (() => HTMLElement) | HTMLElement;
    handler: ({ params, query, }: RouteHandlerParams) => HTMLElement | Promise<HTMLElement>;
    before?: GuardFn;
    after?: GuardFn;
    onRouteChange?: (route: Route) => void;
    children?: Routes;
};
type Routes = Route[];
export declare const getCurrentRoute: () => Route | null;
declare let beforeEachFn: () => Promise<void | boolean> | void | boolean;
export declare const beforeEach: (fn: typeof beforeEachFn | null) => () => Promise<void | boolean> | void | boolean;
export declare const afterEach: (fn: typeof beforeEachFn | null) => () => Promise<void | boolean> | void | boolean;
export declare const createRouter: (newRoutes: Routes) => Promise<void>;
export type RouteParams = {
    name?: string;
    path?: string;
    url?: string;
    params?: Record<string, string>;
    query?: Record<string, string | number | boolean>;
    delta?: number;
    replace?: boolean;
};
export declare const go: ({ path, name, params, query, delta, replace, }: RouteParams) => void | Promise<void>;
export {};
