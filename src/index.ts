type RouteHandlerParams = {
	params?: Record<string, string>;
	query?: Record<string, string>;
};

export type GuardFn = (
	guardParams: RouteHandlerParams
) => Promise<void | boolean> | void | boolean;

export type Route = {
	name: string;
	path: `/${string}` | "*";
	target?: string | (() => HTMLElement) | HTMLElement;
	handler: ({
		params,
		query,
	}: RouteHandlerParams) => HTMLElement | Promise<HTMLElement>;
	before?: GuardFn;
	after?: GuardFn;
	onRouteChange?: (route: Route) => void;
	children?: Routes;
};

type Routes = Route[];

let currentRoute: Route | null;
export const getCurrentRoute = () => currentRoute;
const defaultOutlet = ".router-outlet";
const mountRouteElement = (
	{ target = defaultOutlet }: Route,
	element: HTMLElement
) => {
	if (typeof target === "string") {
		target = document.querySelector(target);
	} else if (typeof target === "function") {
		target = target();
	}
	(target as HTMLElement).replaceChildren(element);
};
let path = "";
const getRouteFromPath = async (initialPath: string, routes: Routes) => {
	const [path, queryString = ""] = initialPath.split("?");
	const query = Object.fromEntries(new URLSearchParams(queryString));
	const [, ...pathParts] = path.split("/");
	for (const route of routes) {
		let routeKey = route.path;
		if (routeKey.startsWith("/")) {
			routeKey = routeKey.slice(1);
		}
		const routeParts = routeKey.split("/");
		let params: Record<string, string> = {};
		for (let i = 0; i < routeParts.length; i++) {
			const isLastIteration = i === routeParts.length - 1;
			const routePart = routeParts[i];
			const pathPart = pathParts[i];
			if (routePart.startsWith(":")) {
				params[routePart.slice(1)] = pathPart;
			}
			let noMatch =
				pathPart !== routePart &&
				route.path !== "*" &&
				!routePart.startsWith(":");
			if (noMatch) {
				break;
			} else if (isLastIteration) {
				if ((await route.before?.({ params, query })) === false) {
					return;
				}
				const routeElement = await route.handler({ params, query });
				mountRouteElement(route, routeElement);
				currentRoute = route;
				await route.after?.({ params, query });
				params = {};
				const remainingPathParts = pathParts.slice(i);
				if (route.children && remainingPathParts.length) {
					await getRouteFromPath(remainingPathParts.join("/"), route.children);
				}
				return;
			}
		}
	}
};

const handleURLChange = async () => {
	currentRoute?.onRouteChange?.(currentRoute);
	if ((await beforeEachFn()) === false) {
		return;
	}
	await getRouteFromPath(window.location.pathname, routes);
	await afterEachFn();
	return;
};

const asyncNoop = async () => {};
type Guard = () => Promise<void>;
let routes: Routes = [];
let beforeEachFn: GuardFn = asyncNoop;
let afterEachFn: GuardFn = asyncNoop;
export const beforeEach = (fn: Guard | null) =>
	(beforeEachFn = fn || asyncNoop);
export const afterEach = (fn: Guard | null) => (afterEachFn = fn || asyncNoop);
export const createRouter = async (newRoutes: Routes) => {
	routes = newRoutes;
	window.removeEventListener("popstate", handleURLChange);
	window.addEventListener("popstate", handleURLChange);
	return handleURLChange();
};

const insertParamsIntoPath = (path: string, params = {}) =>
	path.replace(/:([^/]+)/g, (match, key: string) => params[key]);
const getRoutePathFromName = (
	routes: Routes,
	routeName: string,
	finalPath = ""
) => {
	for (const { name, path, children } of routes) {
		if (name === routeName) {
			return finalPath + path;
		}
		if (children) {
			const childRoute = getRoutePathFromName(
				children,
				routeName,
				finalPath + path
			);
			if (childRoute) {
				return childRoute;
			}
		}
	}
	throw new Error(`No route found with name ${name}`);
};

type RouteParams = {
	path?: string;
	url?: string;
	params?: Record<string, string>;
	query?: Record<string, string | number | boolean>;
	delta?: number;
	replace?: boolean;
};

export const go = ({
	path = "",
	name,
	params,
	query = {},
	delta,
	replace,
}: RouteParams) => {
	if (delta) {
		return window.history.go(delta);
	}
	path ||= getRoutePathFromName(routes, name);
	path = insertParamsIntoPath(path, params);
	const queryString = new URLSearchParams(query).toString();
	path += queryString ? `?${queryString}` : "";
	if (replace) {
		window.history.replaceState(null, "", path);
	} else {
		window.history.pushState(null, "", path);
	}
	return handleURLChange();
};
