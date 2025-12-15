const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");

const entries = [
  { input: "src/index.ts", output: "dist/index" },
  { input: "src/actions/index.ts", output: "dist/actions/index" },
  { input: "src/accounts/index.ts", output: "dist/accounts/index" },
  { input: "src/types/index.ts", output: "dist/types/index" },
  { input: "src/chains/index.ts", output: "dist/chains/index" },
  { input: "src/clients/index.ts", output: "dist/clients/index" },
  { input: "src/utils/index.ts", output: "dist/utils/index" },
];

module.exports = entries.map(({ input, output }) => ({
  input,
  output: [
    {
      file: `${output}.js`,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: `${output}.mjs`,
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
    }),
  ],
  external: ["permissionless", "viem", /^permissionless\/.*/, /^viem\/.*/],
}));
