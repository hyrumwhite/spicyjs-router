import { expect, test, vi, beforeAll, beforeEach } from "vitest";
import * as router from "../src/index";

const defaultOutlet = () => document.querySelector(".router-outlet");

const component1 = "component-1";
const component2 = "component-2";
const component3 = "component-3";
const componentFactory = (className: string) => {
	return () => {
		const div = document.createElement("div");
		div.textContent = className;
		div.className = className;
		return div;
	};
};

const asyncTimeout = (duration: number) =>
	new Promise((resolve) => setTimeout(resolve, duration));

let handleURLChange = () => {};
let historyEntries: [[string, string, string]] = [];
const updateHistory = (thing: null, title: string, path: string) => {
	historyEntries.push([thing, title, path]);
	globalThis.window.location.pathname = path;
};
const replaceHistory = (thing: null, title: string, path: string) => {
	historyEntries.pop();
	historyEntries.push([thing, title, path]);
	globalThis.window.location.pathname = path;
};
beforeAll(() => {
	historyEntries = [];
	const mountPoint = document.createElement("div");
	mountPoint.className = "router-outlet";
	document.body.appendChild(mountPoint);
	globalThis.window = {
		location: {
			pathname: "/",
		},
		addEventListener: (key: string, fn: () => void) => (handleURLChange = fn),
		removeEventListener: vi.fn(),
		history: {
			go: vi.fn((delta: number) => {
				const entry = historyEntries[historyEntries.length + delta];
				globalThis.window.location.pathname = entry[2];
				handleURLChange();
			}),
			pushState: vi.fn(updateHistory),
			replaceState: vi.fn(replaceHistory),
		},
	};
});
beforeEach(() => {
	const outlet = defaultOutlet();
	if (outlet) {
		outlet.innerHTML = "";
	}
});
test("loads the default route", async () => {
	const defaultComponent = componentFactory(component1)();
	await router.createRouter([
		{
			name: "default",
			path: "/",
			handler: () => defaultComponent,
		},
	]);
	const route = router.getCurrentRoute();
	const renderedComponent = document.querySelector(`.${component1}`);
	expect(route?.name).toEqual("default");
	expect(defaultComponent).toEqual(renderedComponent);
});
test("loads the catchall routes", async () => {
	const defaultComponent = componentFactory(component1)();
	await router.createRouter([
		{
			name: "catchall",
			path: "*",
			handler: () => defaultComponent,
		},
	]);
	const route = router.getCurrentRoute();
	const renderedComponent = document.querySelector(`.${component1}`);
	expect(route?.name).toEqual("catchall");
	expect(defaultComponent).toEqual(renderedComponent);
});

test("designate a route with name", async () => {
	const defaultComponent = componentFactory(component1)();
	const aboutComponent = componentFactory(component2)();
	await router.createRouter([
		{
			name: "default",
			path: "/",
			handler: () => defaultComponent,
		},
		{
			name: "about",
			path: "/about",
			handler: () => aboutComponent,
		},
	]);
	await router.go({ name: "about" });
	const route = router.getCurrentRoute();
	const renderedComponent = document.querySelector(`.${component2}`);
	expect(route?.name).toEqual("about");
	expect(aboutComponent).toEqual(renderedComponent);
});

test("parameters and queries can be passed", async () => {
	const defaultComponent = componentFactory(component1)();
	const aboutComponent = componentFactory(component2)();
	const settingsComponent = componentFactory(component3)();
	const aboutHandler = vi.fn(() => aboutComponent);
	await router.createRouter([
		{
			name: "default",
			path: "/",
			handler: () => defaultComponent,
		},
		{
			name: "about",
			path: "/about/:id",
			handler: aboutHandler,
		},
		{
			name: "settings",
			path: "/settings/:setting/item/:item",
			handler: () => settingsComponent,
		},
	]);
	await router.go({
		name: "about",
		params: { id: 77 },
		query: { search: "test", limit: 12 },
	});
	let route = router.getCurrentRoute();
	expect(aboutHandler).toBeCalledWith({
		params: { id: "77" },
		query: { search: "test", limit: "12" },
	});
	expect(window.location.pathname).toEqual("/about/77?search=test&limit=12");
	expect(router.getCurrentRoute().name).toEqual("about");
	await router.go({
		name: "settings",
		params: { setting: 77, item: "bob" },
	});
	route = router.getCurrentRoute();
	expect(window.location.pathname).toEqual("/settings/77/item/bob");
	expect(router.getCurrentRoute().name).toEqual("settings");
});

test("designate a route with path", async () => {
	const defaultComponent = componentFactory(component1)();
	const aboutComponent = componentFactory(component2)();
	await router.createRouter([
		{
			name: "default",
			path: "/",
			handler: () => defaultComponent,
		},
		{
			name: "about",
			path: "/about",
			handler: () => aboutComponent,
		},
	]);
	await router.go({ path: "/about" });
	const route = router.getCurrentRoute();
	const renderedComponent = document.querySelector(`.${component2}`);
	expect(route?.name).toEqual("about");
	expect(aboutComponent).toEqual(renderedComponent);
});

test("nav guards work", async () => {
	const beforeEach = vi.fn();
	router.beforeEach(beforeEach);
	const afterEach = vi.fn();
	router.afterEach(afterEach);
	const before = vi.fn();
	const after = vi.fn();
	const defaultComponent = componentFactory(component1)();
	const aboutComponent = componentFactory(component2)();
	await router.createRouter([
		{
			name: "default",
			path: "/",
			handler: () => defaultComponent,
		},
		{
			name: "about",
			path: "/about",
			handler: () => aboutComponent,
			before,
			after,
		},
		{
			name: "redirect",
			path: "/redirect",
			before() {
				router.go({ name: "about" });
				return false;
			},
		},
	]);
	expect(beforeEach).toBeCalled();
	expect(afterEach).toBeCalled();
	await router.go({ name: "about" });
	expect(before).toBeCalled();
	expect(after).toBeCalled();
	await router.go({ name: "redirect" });
	const route = router.getCurrentRoute();
	const renderedComponent = document.querySelector(`.${component2}`);
	expect(route?.name).toEqual("about");
	expect(aboutComponent).toEqual(renderedComponent);
});

test("renders nested routes", async () => {
	const div = document.createElement("div");
	const subrouteOutlet = document.createElement("div");
	subrouteOutlet.className = "sub-router-outlet2";
	div.appendChild(subrouteOutlet);
	div.classname = "about-me-route";
	const el1 = componentFactory(component1)();
	const el2 = componentFactory(component2)();
	const el3 = componentFactory(component3)();
	const el4 = componentFactory("component-4")();
	await router.createRouter([
		{
			name: "default",
			path: "/",
			handler: () => el1,
		},
		{
			name: "about",
			path: "/about",
			handler: () => div,
			children: [
				{
					name: "comp2",
					path: "/2",
					target: subrouteOutlet,
					handler: async () => {
						await asyncTimeout(0);
						return el2;
					},
				},
				{
					name: "comp3",
					path: "/3",
					target: subrouteOutlet,
					handler: () => el3,
				},
				{
					name: "comp4",
					path: "*",
					target: subrouteOutlet,
					handler: () => el4,
				},
			],
		},
	]);
	await router.go({ name: "comp3" });
	const route = router.getCurrentRoute();
	expect(el3.isConnected).toEqual(true);
	expect(subrouteOutlet).toEqual(el3.parentElement);
	await router.go({ name: "comp2" });
	expect(el2.isConnected).toEqual(true);
	expect(subrouteOutlet).toEqual(el2.parentElement);
	await router.go({ path: "/about/5" });
	expect(el4.isConnected).toEqual(true);
	expect(subrouteOutlet).toEqual(el4.parentElement);
});
