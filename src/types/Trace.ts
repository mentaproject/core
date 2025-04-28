import type { BlockTag, Hash, Quantity } from "@/types";

export type TraceType = "call" | "create" | "delegatecall" | "staticcall" | "suicide" | string;
export type CallType = "call" | "delegatecall" | "staticcall" | string;

// =============================================================================
// Core Trace Types
// =============================================================================

export type GenericTraceAction = {
    callType?: CallType;
    from: string;
    gas: string;
    input: string;
    to?: string | null;
    value: string;
};
export type GenericTraceActionResult = {
    gasUsed: string;
    output: string;
    address?: string;
    error?: string;
    revertReason?: string;
};
export type GenericTraceEntry = {
    action?: GenericTraceAction;
    blockHash: string;
    blockNumber: number;
    result?: GenericTraceActionResult;
    subtraces: number;
    traceAddress: number[];
    transactionHash: string;
    transactionPosition: number;
    type: TraceType;
    error?: string;
};

// =============================================================================
// trace_transaction Types
// =============================================================================

export type TraceTransactionParameters = Hash;
export type TraceTransactionReturnType = GenericTraceEntry[];

// =============================================================================
// trace_filter Types
// =============================================================================

export type TraceFilterParameters = {
    fromBlock?: string;
    toBlock?: string;
    fromAddress?: string | string[];
    toAddress?: string | string[];
    after?: number;
    count?: number;
};
export type TraceFilterReturnType = GenericTraceEntry[];

// =============================================================================
// trace_block Types
// =============================================================================

export type BlockTraceTransactionResult = {
    transactionHash: string;
    trace: GenericTraceEntry[];
};
export type TraceBlockParameters = Quantity | BlockTag;
export type TraceBlockReturnType = BlockTraceTransactionResult[];
