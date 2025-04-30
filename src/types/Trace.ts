import type { Address, BlockTag, Hash, Quantity } from "./index";

export type TraceType = "call" | "create" | "delegatecall" | "staticcall" | "suicide" | string;
export type CallType = "call" | "delegatecall" | "staticcall" | string;

// =============================================================================
// Core Trace Types
// =============================================================================

export type TraceAction = {
    callType?: CallType;
    from: string;
    gas: string;
    input: string;
    to?: string | null;
    value: string;
};
export type TraceActionResult = {
    gasUsed: string;
    output: string;
    address?: string;
    error?: string;
    revertReason?: string;
};
export type TraceEntry = {
    action?: TraceAction;
    blockHash: string;
    blockNumber: number;
    result?: TraceActionResult;
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
export type TraceTransactionReturnType = TraceEntry[];

// =============================================================================
// trace_filter Types
// =============================================================================

export type TraceFilterParameters = {
    fromBlock?: Quantity | BlockTag;
    toBlock?: Quantity | BlockTag;
    fromAddress?: Address | Address[];
    toAddress?: Address | Address[];
    after?: number;
    count?: number;
};
export type TraceFilterReturnType = TraceEntry[];

// =============================================================================
// trace_block Types
// =============================================================================

export type BlockTraceTransactionResult = {
    transactionHash: string;
    trace: TraceEntry[];
};
export type TraceBlockParameters = Quantity | BlockTag;
export type TraceBlockReturnType = BlockTraceTransactionResult[];
