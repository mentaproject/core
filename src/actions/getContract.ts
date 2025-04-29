import type { AbiFunction, AbiItem, GetContractReturnType, GetContractParameters, CoreClient } from "../types";

import { Contract } from "../structures";
import { buildAbiFunction } from "../utils";

/**
 * Creates a type-safe contract instance with runtime methods for ABI functions.
 *
 * Instantiates the base `Contract` class (which includes built-in methods like
 * `.on` and `.decodeErrorResult`) and dynamically adds callable methods for each
 * `function` in the provided ABI, using Viem/Permissionless actions for
 * read (`eth_call`) or write (`eth_sendTransaction` / UserOperation) operations.
 *
 * @template P Captures the specific parameters type, including the `abi` array (use `as const` on ABI).
 * @param client The CoreClient instance used to be injected in the contract instance for RPC interactions.
 * @param params Contract parameters: `{ address, abi }`.
 * @returns A contract instance augmented with typed methods for all ABI functions.
 */
export function getContract<P extends GetContractParameters<ReadonlyArray<AbiItem>>>(
    client: CoreClient,
    params: P
): GetContractReturnType<P> {

    // 1. Filter ABI for function definitions
    const functionsAbi = params.abi.filter(
        (item): item is AbiFunction => item.type === 'function'
    );

    // 2. Create the base contract instance
    const contractInstance = new Contract(client, params);

    // 3. Dynamically add methods using the build function
    for (const funcAbi of functionsAbi) {
        // `buildAbiFunction` creates the callable async function
        (contractInstance as any)[funcAbi.name] = buildAbiFunction(
            contractInstance as Contract<any>,
            client,
            funcAbi
        );
    }

    // 4. Return the fully typed and augmented instance
    return contractInstance as GetContractReturnType<P>;
};