import { FetchBlockRangeParameters } from "../types/BlockRangeFetcher";

function calcBlockRange(fromBlock: bigint, rangeSize: number, direction: "backward" | "forward" = "forward") {
    if (direction === "backward") return { fromBlock: fromBlock - BigInt(rangeSize), toBlock: fromBlock };
    return { fromBlock: fromBlock, toBlock: fromBlock + BigInt(rangeSize) };
};

function hasHitBlockLimit(blockNumber: bigint, direction: "backward" | "forward", blockLimit: bigint) {
    return direction === "backward" ? blockNumber < blockLimit : blockNumber > blockLimit;
};

function hasHitItemLimit(items: any[], itemLimit: number) {
    return items.length >= itemLimit;
};

/**
 * Fetch large amounts of data in batches by exploring with dynamic block ranges.
 * 
 * Block ranges automatically adjust based on the provided configuration and how many items are found per batch. 
 * If the actual block range returns too many items, the explorer will automatically reduce the range size for the next batch. 
 * If the actual block range returns too few items, the explorer will automatically increase the range size for the next batch.
 * 
 * This method is optimized to maximize efficiency by fetching items and minimizing the charge on the RPC node by 
 * requesting too many items per batch or too many batches per second.
 * 
 * Useful for methods like `eth_getLogs` or `trace_filter` that iterate over blocks to find items.
 * 
 * @param params - The parameters for creating the explorer.
 */
export async function fetchByBlockRange(params: FetchBlockRangeParameters) {
    const options = {

        // By how much to increase/decrease the range size if the batch returns few/many items
        dividerOnHigh: 2,
        multiplierOnLow: 1.5,
        multiplierOnZero: 2,

        // How to determine if the batch returned few/many items
        highActivityThreshold: 50,
        lowActivityThreshold: 10,

        // Limits and init values for the range size
        initialRangeSize: 100,
        maxRangeSize: 100_000,
        minRangeSize: 1,

        // 
        ...params.options,
    };

    let currentBlock = params.fromBlock;
    let rangeSize = options.initialRangeSize;
    let stopped = false;

    const stop = () => {
        stopped = true;
    };

    const totalItems: any[] = [];

    function shouldStop() {
        return hasHitBlockLimit(currentBlock, params.direction, params.toBlock) || hasHitItemLimit(totalItems, params.itemLimit);
    }

    while (!stopped && !shouldStop() ) {
        const blockRange = calcBlockRange(currentBlock, rangeSize, params.direction);

        // Cap the block range to the overall limits
        if (params.direction === "forward") {
            if (blockRange.toBlock > params.toBlock) {
                blockRange.toBlock = params.toBlock;
            }
        } else { // backward
            if (blockRange.fromBlock < params.toBlock) {
                blockRange.fromBlock = params.toBlock;
            }
        }

        const batchItems = await params.onBlockRange(blockRange, stop);

        totalItems.push(...batchItems);

        if (stopped) break;

        // Adjust range size based on activity
        if (batchItems.length > options.highActivityThreshold) {
            rangeSize /= options.dividerOnHigh;
        } else if (batchItems.length === 0) {
            rangeSize *= options.multiplierOnZero;
        } else if (batchItems.length <= options.lowActivityThreshold) {
            rangeSize *= options.multiplierOnLow;
        }

        // Cap and round the range size
        rangeSize = Math.round(
            Math.max(options.minRangeSize, Math.min(options.maxRangeSize, rangeSize))
        );

        // Determine the next block to start from, fixing the "backward" direction logic
        if (params.direction === "backward") {
            currentBlock = blockRange.fromBlock - 1n;
        } else {
            currentBlock = blockRange.toBlock + 1n;
        }
    }

    return totalItems.slice(0, params.itemLimit);
}
