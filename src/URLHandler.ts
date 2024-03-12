export type Routes = {
	name: string;
	route: string;
	handler: <T>(...params: T) => HTMLElement;
	before: () => Promise<void>;
	after: () => Promise<void>;
	children: Routes;
}[];

let routes: Routes = [];
export const setRoutes = (newRoutes: Routes) => (routes = newRoutes);
