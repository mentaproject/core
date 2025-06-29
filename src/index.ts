/**
 * @summary Transaction serialization error type.
 */
export { SerializeTransactionErrorType } from "viem/chains";

/**
 * @summary Creates a Menta client with the specified configuration.
 * @param {CoreClientConfig} parameters - The client configuration parameters.
 * @returns {CoreClient} A Menta client.
 * @example
 * import { createClient, http } from 'menta';
 * import { mainnet } from 'viem/chains';
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http("https://mainnet.infura.io/v3/YOUR_API_KEY"),
 * });
 */
export { createClient } from "./clients";

/**
 * @summary HTTP transport for Viem clients.
 */
export { http } from "viem";

/**
 * @summary WebSocket transport for Viem clients.
 */
export { webSocket } from "viem";

/**
 * @summary Null address (0x00...00).
 */
export { zeroAddress } from "viem";

/**
 * @summary Null hash (0x00...00).
 */
export { zeroHash } from "viem";

export * from "viem/accounts";

export {
    getEnsAddress,
    getEnsAvatar,
    getEnsName,
    getEnsResolver,
    getEnsText,
    call,
    createAccessList,
    createBlockFilter,
    createContractEventFilter,
    createEventFilter,
    createPendingTransactionFilter,
    estimateContractGas,
    estimateFeesPerGas,
    estimateMaxPriorityFeePerGas,
    estimateGas,
    getBalance,
    getBlobBaseFee,
    getBlock,
    getBlockNumber,
    getBlockTransactionCount,
    getChainId,
    getCode,
    getBytecode,
    getContractEvents,
    getEip712Domain,
    getFeeHistory,
    getFilterChanges,
    getFilterLogs,
    getGasPrice,
    getLogs,
    getStorageAt,
    getTransactionConfirmations,
    getTransactionCount,
    getTransaction,
    getTransactionReceipt,
    multicall,
    simulateBlocks,
    simulateContract,
    simulateCalls,
    watchBlocks,
    watchBlockNumber,
    watchEvent,
    watchContractEvent,
    watchPendingTransactions,
    readContract,
    getProof,
    waitForTransactionReceipt,
} from "viem/actions";

export {
    sendTransaction, signMessage, signTypedData, writeContract
} from "permissionless/actions/smartAccount";

/** Trace Actions */
/**
 * @summary Calls the 'trace_filter' RPC method to retrieve filtered execution traces.
 * @param {CoreClient} client - The CoreClient instance used to make the RPC call.
 * @param {TraceFilterParameters} params - The filtering parameters for the trace request.
 * @returns {Promise<TraceFilterReturnType>} A promise that returns an array of trace entries.
 * @example
 * import { createClient, http, traceFilter } from 'menta';
 * import { mainnet } from 'viem/chains';
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http("https://mainnet.infura.io/v3/YOUR_API_KEY"),
 * });
 *
 * const traces = await traceFilter(client, {
 *   fromBlock: "0x1",
 *   toBlock: "0x2",
 *   fromAddress: ["0x..."],
 * });
 */
export { traceFilter } from "./actions/traceFilter";
/**
 * @summary Calls the 'trace_transaction' RPC method to retrieve execution traces for a specific transaction.
 * @param {CoreClient} client - The CoreClient instance used to make the RPC call.
 * @param {TraceTransactionParameters} params - The transaction hash for which to retrieve traces.
 * @returns {Promise<TraceTransactionReturnType>} A promise that returns an array of trace entries.
 * @example
 * import { createClient, http, traceTransaction } from 'menta';
 * import { mainnet } from 'viem/chains';
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http("https://mainnet.infura.io/v3/YOUR_API_KEY"),
 * });
 *
 * const traces = await traceTransaction(client, {
 *   hash: "0x...",
 * });
 */
export { traceTransaction } from "./actions/traceTransaction";

/** Block Range Actions */
/**
 * @summary Creates a pager to iterate over block ranges.
 * @template T - The type of items to paginate, must extend PaginatableItem.
 * @param {createBlockRangePagerParameters} params - The parameters for creating the pager.
 * @param {onBlockRangeCallback<T>} onBlockRange - The callback function to execute for each block range to retrieve items.
 * @param {PaginationState} [paginationState] - The initial pagination state (used to retrieve subsequent pages).
 * @returns {Promise<PaginatedResult<T>>} A promise that resolves with a PaginatedResult object containing the first page of items and a function to retrieve the next page.
 * @example
 * import { createBlockRangePager, createClient, http } from 'menta';
 * import { mainnet } from 'viem/chains';
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http("https://mainnet.infura.io/v3/YOUR_API_KEY"),
 * });
 *
 * async function getLogsInBlockRange({ client, blockRange }) {
 *   const logs = await client.getLogs({
 *     fromBlock: blockRange.fromBlock,
 *     toBlock: blockRange.toBlock,
 *   });
 *   return logs.map(log => ({ ...log, blockNumber: log.blockNumber }));
 * }
 *
 * const pager = await createBlockRangePager(
 *   {
 *     itemsPerPage: 100,
 *     startBlock: 1000n,
 *     blockLimit: 100n,
 *     direction: "forward",
 *   },
 *   ({ blockRange }) => getLogsInBlockRange({ client, blockRange })
 * );
 *
 * console.log("First page logs:", pager.items);
 * const nextPage = await pager.next();
 * console.log("Second page logs:", nextPage.items);
 */
export { createBlockRangePager } from "./actions/createBlockRangePager";

export * from "viem/chains";

/**
 * @summary Represents the result of a pagination operation.
 * @template T - The type of paginated items.
 * @property {T[]} items - The items on the current page.
 * @property {boolean} hasNext - Indicates if there is a next page.
 * @property {function(): Promise<PaginatedResult<T>>} next - Function to retrieve the next page.
 */
export { PaginatedResult } from './structures/PaginatedResult';

/**
 * @summary Base error for ABI types.
 */
export { BaseError } from "abitype";
/**
 * @summary Raw contract error.
 */
export { RawContractError } from "viem";

/**
 * @summary Represents an access list for an EIP-2930 transaction.
 */
export type { AccessList } from 'viem';
/**
 * @summary Represents an Ethereum address.
 */
export type { Address } from 'viem';
/**
 * @summary Represents a cryptographic hash.
 */
export type { Hash } from 'viem';
/**
 * @summary Represents a hexadecimal string.
 */
export type { Hex } from 'viem';
/**
 * @summary Represents a block tag (e.g., "latest", "earliest", "pending").
 */
export type { BlockTag } from 'viem';
/**
 * @summary Represents a blockchain.
 */
export type { Chain } from 'viem';
/**
 * @summary Represents a log event on the blockchain.
 */
export type { Log } from 'viem';
/**
 * @summary Represents the type of a transaction.
 */
export type { TransactionType } from 'viem';
/**
 * @summary Represents a numeric quantity.
 */
export type { Quantity } from 'viem';
/**
 * @summary Represents an ABI (Application Binary Interface) item.
 */
export type { AbiItem } from 'viem';
/**
 * @summary Represents a transport for Viem clients.
 */
export type { Transport } from 'viem';
export type {
    GetEnsAddressReturnType,
    GetEnsAvatarReturnType,
    GetEnsNameReturnType,
    GetEnsResolverReturnType,
    GetEnsTextReturnType,
    CallReturnType,
    CreateAccessListReturnType,
    CreateBlockFilterReturnType,
    CreateContractEventFilterReturnType,
    CreateEventFilterReturnType,
    CreatePendingTransactionFilterReturnType,
    EstimateContractGasReturnType,
    EstimateFeesPerGasReturnType,
    EstimateMaxPriorityFeePerGasReturnType,
    EstimateGasReturnType,
    GetBalanceReturnType,
    GetBlobBaseFeeReturnType,
    GetBlockReturnType,
    GetBlockNumberReturnType,
    GetBlockTransactionCountReturnType,
    GetChainIdReturnType,
    GetCodeReturnType,
    GetBytecodeReturnType,
    GetContractEventsReturnType,
    GetEip712DomainReturnType,
    GetFeeHistoryReturnType,
    GetFilterChangesReturnType,
    GetFilterLogsReturnType,
    GetLogsReturnType,
    GetStorageAtReturnType,
    GetTransactionConfirmationsReturnType,
    GetTransactionCountReturnType,
    GetTransactionReturnType,
    GetTransactionReceiptReturnType,
    MulticallReturnType,
    SimulateBlocksReturnType,
    SimulateContractReturnType,
    SimulateCallsReturnType,
    WatchBlocksReturnType,
    WatchBlockNumberReturnType,
    WatchEventReturnType,
    WatchContractEventReturnType,
    WatchPendingTransactionsReturnType,
    ReadContractReturnType,
    GetProofReturnType,
    WaitForTransactionReceiptReturnType,
    SendTransactionReturnType,
    SignMessageReturnType,
    SignTypedDataReturnType,
    WriteContractReturnType,
    GetEnsAddressParameters,
    GetEnsAvatarParameters,
    GetEnsNameParameters,
    GetEnsResolverParameters,
    GetEnsTextParameters,
    CallParameters,
    CreateAccessListParameters,
    CreateContractEventFilterParameters,
    CreateEventFilterParameters,
    EstimateContractGasParameters,
    EstimateFeesPerGasParameters,
    EstimateMaxPriorityFeePerGasParameters,
    EstimateGasParameters,
    GetBalanceParameters,
    GetBlockParameters,
    GetBlockNumberParameters,
    GetBlockTransactionCountParameters,
    GetCodeParameters,
    GetBytecodeParameters,
    GetContractEventsParameters,
    GetEip712DomainParameters,
    GetFeeHistoryParameters,
    GetFilterChangesParameters,
    GetFilterLogsParameters,
    GetStorageAtParameters,
    GetTransactionConfirmationsParameters,
    GetTransactionCountParameters,
    GetTransactionParameters,
    GetTransactionReceiptParameters,
    MulticallParameters,
    SimulateBlocksParameters,
    SimulateContractParameters,
    SimulateCallsParameters,
    WatchBlocksParameters,
    WatchBlockNumberParameters,
    WatchEventParameters,
    WatchContractEventParameters,
    WatchPendingTransactionsParameters,
    ReadContractParameters,
    GetProofParameters,
    WaitForTransactionReceiptParameters,
    SendTransactionParameters,
    SignMessageParameters,
    SignTypedDataParameters,
    WriteContractParameters,
} from "viem";

export type { AbiError, AbiConstructor, AbiFunction, AbiEvent, AbiParameter, AbiParameterToPrimitiveType } from "abitype";

/**
 * @summary Represents a Menta client extended with specific functionalities.
 */
export type { CoreClient } from './types/CoreClient';

/**
 * @summary Configuration for creating a Menta client.
 * @property {Client | undefined} client - An existing Viem client to extend.
 * @property {string | undefined} key - Client identification key.
 * @property {string | undefined} name - Client name.
 * @property {object | undefined} paymaster - Paymaster configuration.
 * @property {object | undefined} paymasterContext - Paymaster context.
 * @property {Transport} transport - The Viem transport to use.
 * @property {object | undefined} userOperation - User operation.
 */
export type { CoreClientConfig } from './types/CoreClient';

/**
 * @summary Parameters for the `trace_filter` method.
 */
export type { TraceFilterParameters } from './types/Trace';
/**
 * @summary Return type for the `trace_filter` method.
 */
export type { TraceFilterReturnType } from './types/Trace';
/**
 * @summary Parameters for the `trace_transaction` method.
 */
export type { TraceTransactionParameters } from './types/Trace';
/**
 * @summary Return type for the `trace_transaction` method.
 */
export type { TraceTransactionReturnType } from './types/Trace';
/**
 * @summary Parameters for the `trace_block` method.
 */
export type { TraceBlockParameters } from './types/Trace';
/**
 * @summary Return type for the `trace_block` method.
 */
export type { TraceBlockReturnType } from './types/Trace';
/**
 * @summary Represents a trace action.
 */
export type { TraceAction } from './types/Trace';
/**
 * @summary Represents the result of a trace action.
 */
export type { TraceActionResult } from './types/Trace';
/**
 * @summary Represents a generic trace entry.
 */
export type { TraceEntry } from './types/Trace';
/**
 * @summary Defines common options for sending a transaction (write operations).
 * @property {bigint | undefined} value - Amount of Ether (in wei) to send with the transaction (only applies to payable functions).
 * @property {bigint | undefined} gas - Gas limit for the transaction.
 * @property {number | undefined} nonce - Nonce for the transaction.
 */
export { TransactionOptions } from './types/Transaction';

/**
 * @summary Public actions available for a Viem client.
 */
/**
 * @summary Public actions available for a Viem client.
 */
export type { PublicActions } from "viem";
/**
 * @summary Wallet actions available for a Viem client.
 */
export type { WalletActions } from "viem";

/**
 * @summary Converts a byte value to an Ethereum address.
 * @param {Hex} bytes - The byte value to convert.
 * @param {number} startByteIndex - The index of the first byte to extract from the byte value.
 * @returns {Address} The Ethereum address.
 * @example
 * import { bytesToAddress } from 'menta';
 * const address = bytesToAddress("0x0000000000000000000000000000000000000000000000000000000000000000", 0);
 * // address: "0x0000000000000000000000000000000000000000"
 */
export { bytesToAddress, bytes32ToAddress } from './utils/bytesToAddress';
/**
 * @summary Returns the address if it is not the zero address, otherwise `undefined`.
 * @param {Address} address - The address to check.
 * @returns {Address | undefined} The address if it is not zero, otherwise `undefined`.
 * @example
 * import { nonZeroAddress, zeroAddress } from 'menta';
 * const addr1 = nonZeroAddress("0x123..."); // "0x123..."
 * const addr2 = nonZeroAddress(zeroAddress); // undefined
 */
export { nonZeroAddress } from './utils/nonZeroAddress';
export * from 'viem/utils';