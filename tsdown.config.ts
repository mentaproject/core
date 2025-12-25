import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "actions/index": "src/actions/index.ts",
    "accounts/index": "src/accounts/index.ts",
    "types/index": "src/types/index.ts",
    "chains/index": "src/chains/index.ts",
    "clients/index": "src/clients/index.ts",
    "utils/index": "src/utils/index.ts",
    "account-abstraction/index": "src/account-abstraction/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  sourcemap: true,
  clean: false,
  external: ["permissionless", "viem", /^permissionless\/.*/, /^viem\/.*/],
});
