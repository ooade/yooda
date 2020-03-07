import fs from "fs";
import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

let pkg = JSON.parse(fs.readFileSync("./package.json", { encoding: "utf-8" }));

export default {
	input: pkg.source,
	plugins: [
		babel({
			exclude: "node_modules/**",
			extensions: [".js", ".ts"]
		}),
		resolve(),
		commonjs(),
		terser()
	],
	output: [
		{
			file: pkg.main,
			format: "cjs",
			sourcemap: true
		},
		{
			file: pkg.module,
			format: "es",
			sourcemap: true
		},
		{
			name: "yooda",
			file: pkg.umd,
			format: "umd",
			sourcemap: true
		}
	]
};
