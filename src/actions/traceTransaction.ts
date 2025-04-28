import  type { TraceTransactionParameters, TraceTransactionReturnType, CoreClient, Hash } from "@/types";

/**
 * Calls the 'trace_transaction' RPC method to retrieve execution traces
 * for a specific transaction hash.
 *
 * This function sends a JSON-RPC request to the Ethereum node (or EVM-compatible)
 * via the provided client object and returns the array of trace entries for
 * the specified transaction hash.
 * 
 * NOTE: This method relies on the non-standard 'trace_transaction' method of the RPC.
 * It may not be supported by all nodes.
 * 
 * @param client The CoreClient instance used to perform the RPC call.
 * @param params The transaction hash for which to retrieve traces.
 * @returns A promise that returns an array of trace entries (GenericTraceEntry[])
 * for the specified transaction hash.
 */
export async function traceTransaction(client: CoreClient, params: TraceTransactionParameters): Promise<TraceTransactionReturnType> {
    return await client.request<{
        method: 'trace_transaction',
        Parameters: TraceTransactionParameters[],
        ReturnType: TraceTransactionReturnType
    }>({
        method: 'trace_transaction',
        params: [params],
    });
}