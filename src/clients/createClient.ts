import type { CoreClient, CoreClientConfig } from '@/types';

import { createClient as viemCreateClient } from 'viem';


export function createClient(parameters: CoreClientConfig): CoreClient {
    const {
        client: client_,
        key = "bundler",
        name = "Bundler Client",
        paymaster,
        paymasterContext,
        transport,
        userOperation
    } = parameters

    const client = Object.assign(
        viemCreateClient({
            ...parameters,
            chain: parameters.chain ?? client_?.chain,
            transport,
            key,
            name,
            type: "bundlerClient" // TODO: is this okay?
        }),
        { client: client_, paymaster, paymasterContext, userOperation }
    )

    return client;
}