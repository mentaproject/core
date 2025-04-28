import type { CoreClient, TransactionOptions, AbiFunction, Hex } from "@/types";
import type { AbiInputsToArgsObject } from "@/types/Abi";

import { BaseError, RawContractError, Contract } from "@/structures";
import { readContract, writeContract } from "@/actions";

/**
 * @internal
 * Prepares the arguments array suitable for Viem/Permissionless contract actions.
 * Note: Assumes Object.values preserves the order defined in the ABI.
 * @param args The named arguments object.
 * @returns An array of arguments or undefined.
 */
function prepareArgsArray(args?: Record<string, any>): unknown[] | undefined {
    return args ? Object.values(args) : undefined;
}

/**
 * @internal
 * Attempts to decode a contract error using the instance's decoder method.
 * If successful, throws an enhanced error including decoded details.
 * Otherwise, re-throws the original error, potentially attaching raw revert data.
 *
 * @param error The caught error (unknown type).
 * @param contractInstance The contract instance containing `decodeErrorResult`.
 * @param functionName The name of the function that failed.
 * @throws {Error} Throws either an enhanced error with decoded data or the original error.
 */
function handleContractError(
    error: unknown,
    contractInstance: Contract<any>, // Use specific P if possible, else 'any' for internal helper
    functionName: string
): never { // Indicates this function always throws
    let errorData: Hex | undefined | null = null;

    // Attempt to extract revert data from various error structures
    // Check for RawContractError directly
    if (error instanceof RawContractError) {
        errorData = typeof error.data === 'string' ? error.data : error.data?.data;
    }
    // Check for BaseError with RawContractError cause (common in viem)
    else if (error instanceof BaseError && 'cause' in error && error.cause instanceof RawContractError) {
        errorData = typeof error.cause.data === 'string' ? error.cause.data : error.cause.data?.data;
    }
    // Generic check for objects with a 'data' property that looks like hex
    else if (typeof error === 'object' && error !== null && 'data' in error) {
        const potentialData = (error as { data?: unknown }).data;
        if (typeof potentialData === 'string' && potentialData.startsWith('0x')) {
            errorData = potentialData as Hex;
        }
    }

    if (errorData) {
        const decodedError = contractInstance.decodeErrorResult(errorData);
        if (decodedError) {
            // Enhance error with decoded details and throw
            const descriptiveError = new Error(
                `Contract call to "${functionName}" reverted with custom error: ${decodedError.errorName}(${JSON.stringify(decodedError.args ?? {})})`
            );
            // Attach details for programmatic access
            // Using 'any' here as we are adding custom properties to the Error object
            (descriptiveError as any).decodedError = decodedError;
            (descriptiveError as any).cause = error; // Preserve original error as cause
            throw descriptiveError;
        } else {
             // Attach raw data if decoding failed but data was present (helps debugging)
             // This attempts to add the raw data to the original error object if it's an object
             if (typeof error === 'object' && error !== null) {
                try { (error as any).revertData = errorData; } catch { /* ignore */ }
             }
        }
    }

    // Re-throw the original error if no specific decoding occurred or if data wasn't found/decoded
    throw error;
}

/**
 * @internal Builds the runtime async function for a read-only (view/pure) ABI function.
 */
function _buildAbiReadFunction(
    contractInstance: Contract<any>,
    coreClient: CoreClient,
    abi: AbiFunction
): (args?: AbiInputsToArgsObject<typeof abi['inputs']>) => Promise<any> {
    return async (args?: AbiInputsToArgsObject<typeof abi['inputs']>) => {
        const functionName = abi.name;
        try {
            // Use Viem's readContract action
            return await readContract(coreClient, {
                address: contractInstance.address,
                abi: [abi],
                functionName: functionName,
                args: prepareArgsArray(args),
            });
        } catch (error: unknown) {
            // Delegate error handling (includes potential decoding)
            handleContractError(error, contractInstance, functionName);
        }
    };
}

/**
 * @internal Builds the runtime async function for a state-changing ABI function.
 */
function _buildAbiWriteFunction(
    contractInstance: Contract<any>,
    coreClient: CoreClient,
    abi: AbiFunction
): (args?: AbiInputsToArgsObject<typeof abi['inputs']>) => Promise<any> {
    return async (...callArgs: any[]) => {
        const functionName = abi.name;
        const account = coreClient.account;

        if (!account) {
            throw new Error(`CoreClient requires an 'account' for state-changing function "${functionName}".`);
        }
        const chain = coreClient.chain;

        if (!chain) {
             throw new Error(`CoreClient requires a 'chain' for writeContract call to "${functionName}".`);
        }

        let argsObject: Record<string, any> | undefined = undefined;
        let optionsObject: TransactionOptions | undefined = undefined;

        // Determine if the function has ABI inputs and/or options
        if (abi.inputs.length > 0) {
            argsObject = callArgs[0];
            optionsObject = callArgs[1];
        } else {
            // No ABI inputs, so the first argument is the options object
            optionsObject = callArgs[0];
        }

        const preparedArgs = prepareArgsArray(argsObject);
        const payableValue = abi.stateMutability === 'payable' ? optionsObject?.value : undefined;

        if (payableValue !== undefined && payableValue > 0n && abi.stateMutability !== 'payable') {
            throw new Error(`Cannot send non-zero value (${payableValue} wei) to non-payable function "${functionName}".`);
        };

        try {
            // Use permissionless' writeContract action (returns tx/userOp hash)
            return await writeContract(coreClient, {
                address: contractInstance.address,
                abi: [abi],
                functionName: functionName,
                args: preparedArgs,
                account: account,
                chain: chain,
                ...optionsObject
            });
        } catch (error: unknown) {
            // Delegate error handling (includes potential decoding)
            handleContractError(error, contractInstance, functionName);
        }
    };
}

/**
 * Builds the runtime callable function for a specific ABI function definition.
 * It determines if the function is read-only or state-changing and delegates
 * to the appropriate internal builder (_buildAbiReadFunction or _buildAbiWriteFunction),
 * which includes error handling and decoding logic.
 *
 * @param contractInstance The contract instance providing context (address, `decodeErrorResult`).
 * @param CoreClient The RPC client instance for making blockchain calls.
 * @param abi The ABI definition of the function to build the method for.
 * @returns An asynchronous function ready to be assigned as a method on the contract instance.
 */
export function buildAbiFunction(
    contractInstance: Contract<any>,
    CoreClient: CoreClient,
    abi: AbiFunction
): (args?: AbiInputsToArgsObject<typeof abi['inputs']>) => Promise<any> {

    const isReadOnly = abi.stateMutability === 'view' || abi.stateMutability === 'pure';

    if (isReadOnly) {
        return _buildAbiReadFunction(contractInstance, CoreClient, abi);
    } else {
        return _buildAbiWriteFunction(contractInstance, CoreClient, abi);
    }
}