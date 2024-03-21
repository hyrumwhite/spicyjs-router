import { vi } from "vitest";

let handleURLChange = () => {};
let historyEntries: [[string, string, string]] = [];
export const clearHistory = () => (historyEntries = []);
const updateHistory = (thing: null, title: string, path: string) => {
	historyEntries.push([thing, title, path]);
	globalThis.window.location.pathname = path;
};
const replaceHistory = (thing: null, title: string, path: string) => {
	historyEntries.pop();
	historyEntries.push([thing, title, path]);
	globalThis.window.location.pathname = path;
};

export default globalThis.window = {
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
