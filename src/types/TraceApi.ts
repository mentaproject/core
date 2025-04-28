import type { Address, BlockTag, Hash, Hex, Quantity } from '@/types';

export type TraceFilterParameters = {
    fromAddress?: Address[];
    toAddress?: Address[];
    fromBlock?: Quantity | BlockTag;
    toBlock?: Quantity | BlockTag;
    after?: number;
    count?: number;
};

export type TraceAction = {
    from: Address;
    callType?: string;
    gas: Hex;
    input: Hex;
    to?: Address | null;
    value?: Hex;
    init?: Hex;
}

export type TraceResult = {
    gasUsed: Hex;
    output: Hex;
    code?: Hex;
    address?: Address;
}

export type TraceObject = {
    action: TraceAction;
    blockHash: Hash;
    blockNumber: number;
    result?: TraceResult | null;
    subtraces: number;
    traceAddress: number[];
    transactionHash?: Hash;
    transactionPosition?: number;
    type: string;
    error?: string;
}

export type TraceFilterReturnType = TraceObject[];
