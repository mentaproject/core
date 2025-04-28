import  type { TraceFilterParameters, TraceFilterReturnType, CoreClient, Hash } from "@/types";

/**
 * Calls the 'trace_filter' RPC method to retrieve execution traces
 * filtered according to the specified criteria.
 *
 * This function sends a JSON-RPC request to the Ethereum node (or EVM-compatible)
 * via the provided client object and returns the array of trace entries matching
 * the filters.
 * 
 * NOTE: This method relies on the non-standard 'trace_filter' method of the RPC.
 * It may not be supported by all nodes.
 *
 * @param client The CoreClient instance used to perform the RPC call.
 * @param params The filtering parameters for the trace request (block range, addresses, etc.).
 * @returns A promise that returns an array of trace entries (GenericTraceEntry[])
 * that match the filtering criteria.
 */
export async function traceFilter(client: CoreClient, params: TraceFilterParameters): Promise<TraceFilterReturnType> {
    return await client.request<{
        method: 'trace_filter',
        Parameters: TraceFilterParameters[],
        ReturnType: TraceFilterReturnType
    }>({
        method: 'trace_filter',
        params: [params],
    });
}