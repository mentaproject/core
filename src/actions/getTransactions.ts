import  type { TraceFilterParameters, TraceFilterReturnType, CoreClient, Hash } from "@/types";

/**
 * Get all transactions involving this account in the given block range.
 * 
 * NOTE: This method relies on the non-standard 'trace_filter' method of the RPC. It may not be supported by all nodes.
 * 
 * @param fromBlock The block number to start scanning from (inclusive).
 * @param toBlock The block number to stop scanning at (inclusive).
 * @returns An array of transaction hashes.
 */
export async function getTransactions(client: CoreClient, params: TraceFilterParameters): Promise<Hash[]> {
    const traces = await client.request<{
        method: 'trace_filter',
        Parameters: TraceFilterParameters[],
        ReturnType: TraceFilterReturnType
    }>({
        method: 'trace_filter',
        params: [params],
    });

    return traces.map((t: { transactionHash?: Hash }) => t.transactionHash).filter((h: Hash | undefined) => h !== undefined) as Hash[];
}