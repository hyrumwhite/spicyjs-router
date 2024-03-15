import { defineConfig } from "vitest/config";
import { resolve } from "path";
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "spicyJSRouter",
			//make sure filename is 'index'
			fileName: "index",
		},
		rollupOptions: {
			external: [],
			output: {
				globals: {},
			},
		},
	},
	test: {
		include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		environment: "jsdom",
	},
});
