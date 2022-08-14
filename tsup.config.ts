import { defineConfig } from "tsup";

export default defineConfig((option) => ({
    entry: ["src/**/*.ts"],
    outDir: "dist",
    target: "node16",
    format: ["cjs"],
    shims: true,
    clean: true,
    splitting: false,
    bundle: false,
    minify: false,
    dts: option.watch ? false : { entry: "src/core/index.ts" },
}));
