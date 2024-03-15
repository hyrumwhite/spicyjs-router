import { defineConfig } from "vite";
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
});
