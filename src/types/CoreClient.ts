import type{ RenameProperty } from '@/types/Utils';
import type { Transport, Chain } from '@/types';

import type { Client as ViemClient } from 'viem';
import type { SmartAccount, BundlerClientConfig } from 'viem/account-abstraction';
import type { SmartAccountClientConfig } from 'permissionless';

export type PermissionlessClientProperties<
    client extends ViemClient | undefined = ViemClient | undefined,
> = {
    client: client
    paymaster: BundlerClientConfig["paymaster"] | undefined
    paymasterContext: BundlerClientConfig["paymasterContext"] | undefined
    userOperation: BundlerClientConfig["userOperation"] | undefined
}

export type CoreClient<
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = ViemClient<Transport, TChain, TAccount> & PermissionlessClientProperties;

export type CoreClientConfig = RenameProperty<SmartAccountClientConfig, "bundlerTransport", "transport">;
