import type { Chain, Client, Transport } from "viem";
import type {
  TraceFilterParameters,
  TraceFilterReturnType,
  TraceTransactionParameters,
  TraceTransactionReturnType,
} from "../types";
import { traceFilter } from "./traceFilter";
import { traceTransaction } from "./traceTransaction";

export type TraceActions = {
  traceFilter: (args: TraceFilterParameters) => Promise<TraceFilterReturnType>;
  traceTransaction: (
    args: TraceTransactionParameters,
  ) => Promise<TraceTransactionReturnType>;
};

export function traceActions(): <TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) => TraceActions {
  return (client) => ({
    traceFilter: (args) => traceFilter(client, args),
    traceTransaction: (args) => traceTransaction(client, args),
  });
}
