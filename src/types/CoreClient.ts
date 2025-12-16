import type { RenameProperty } from "./Utils";
import type { Transport, Chain } from "./";

import type { Client as ViemClient } from "viem";
import type {
  SmartAccount,
  BundlerClientConfig,
} from "viem/account-abstraction";
import type { SmartAccountClientConfig } from "permissionless";

export type PermissionlessClientProperties<
  client extends ViemClient | undefined = ViemClient | undefined,
> = {
  client: client;
  paymaster: BundlerClientConfig["paymaster"] | undefined;
  paymasterContext: BundlerClientConfig["paymasterContext"] | undefined;
  userOperation: BundlerClientConfig["userOperation"] | undefined;
};

/**
 * A basic viem Client used for standard RPC operations.
 * This is the type returned by createClient before smart account setup.
 */
export type CoreClient<TChain extends Chain | undefined = Chain | undefined> =
  ViemClient<Transport, TChain>;

/**
 * A SmartAccountClient with permissionless properties.
 * This is the type returned after setting up the smart account.
 */
export type SmartAccountCoreClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = ViemClient<Transport, TChain, TAccount> & PermissionlessClientProperties;

export type CoreClientConfig = RenameProperty<
  SmartAccountClientConfig,
  "bundlerTransport",
  "transport"
>;
