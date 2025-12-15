import type { Client, Transport, Chain } from "viem";
import type { TraceFilterParameters, TraceFilterReturnType } from "../types";

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
 * @param client The client instance used to perform the RPC call.
 * @param params The filtering parameters for the trace request (block range, addresses, etc.).
 * @returns A promise that returns an array of trace entries (GenericTraceEntry[])
 * that match the filtering criteria.
 */
export async function traceFilter<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  params: TraceFilterParameters,
): Promise<TraceFilterReturnType> {
  if (typeof params.fromAddress === "string")
    params.fromAddress = [params.fromAddress];
  if (typeof params.toAddress === "string")
    params.toAddress = [params.toAddress];

  return await client.request<{
    method: "trace_filter";
    Parameters: TraceFilterParameters[];
    ReturnType: TraceFilterReturnType;
  }>({
    method: "trace_filter",
    params: [params],
  });
}
