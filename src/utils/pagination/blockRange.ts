import { bigIntMax, bigIntMin } from '../bigint';
import { BlockRange, BlockRangePagerConfig, RangeCalculatorParameters } from '../../types/Pagination';

/**
 * Calculates the block range for a backward search.
 * Searches from startBlock downwards towards blockLimit.
 * 
 * @param params - Parameters including startBlock (inclusive end), rangeSize, and blockLimit (genesis, inclusive lower bound).
 * @returns The calculated fromBlock and toBlock range, or null if no valid range exists below startBlock.
 */
export const getBackwardBlockRange = (params: RangeCalculatorParameters): BlockRange | null => {
    const { startBlock, rangeSize, blockLimit } = params;

    // If the current search block is already below the block limit (genesis), there's no range left.
    if (startBlock < blockLimit) return null;

    const toBlock = startBlock; // Start block for backward search is the end of the range
    // Calculate the beginning of the range. Ensure it doesn't go below the block limit (genesis).
    // Range size N means [from, to] where to - from + 1 = N. So from = to - N + 1.
    const targetFrom = startBlock - BigInt(rangeSize) + 1n;
    const fromBlock = bigIntMax(blockLimit, targetFrom);

    // If the calculated 'from' block is after the 'to' block, it means the remaining blocks
    // from blockLimit up to 'toBlock' are fewer than the requested rangeSize.
    // The valid range is from blockLimit up to 'toBlock'. This check handles cases where
    // startBlock is very close to blockLimit with a large rangeSize.
    if (fromBlock > toBlock) {
         // This should only happen if toBlock is >= blockLimit, otherwise the first check would return null.
         return { fromBlock: blockLimit, toBlock: toBlock };
    }

    // If fromBlock <= toBlock, the calculated range is valid.
    return { fromBlock, toBlock };
};

/**
 * Calculates the block range for a forward search.
 * Searches from startBlock upwards towards blockLimit (latest).
 * 
 * @param params - Parameters including startBlock (inclusive beginning), rangeSize, and blockLimit (latest, inclusive upper bound).
 * @returns The calculated fromBlock and toBlock range, or null if no valid range exists above startBlock.
 */
export const getForwardBlockRange = (params: RangeCalculatorParameters): BlockRange | null => {
    const { startBlock, rangeSize, blockLimit } = params;

    // If the current search block is already beyond the block limit (latest), there's no range left.
    if (startBlock > blockLimit) return null;

    const fromBlock = startBlock; // Start block for forward search is the beginning of the range
    // Calculate the end of the range. Ensure it doesn't go beyond the block limit (latest).
    // to = from + N - 1.
    const targetTo = startBlock + BigInt(rangeSize) - 1n;
    const toBlock = bigIntMin(blockLimit, targetTo);

    // If the calculated 'from' block is after the 'to' block, it means startBlock was already
    // effectively at or beyond the blockLimit with a tiny rangeSize.
    // The valid range is from 'fromBlock' up to blockLimit. This check handles cases where
    // startBlock is very close to blockLimit with a tiny rangeSize.
    if (fromBlock > toBlock) {
        // This should only happen if fromBlock <= blockLimit, otherwise the first check would return null.
        return { fromBlock: fromBlock, toBlock: blockLimit };
    }

    // If fromBlock <= toBlock, the calculated range is valid.
    return { fromBlock, toBlock };
};

/**
 * Calculates the block range for a given search direction.
 * 
 * @param params - Parameters including startBlock (inclusive beginning or end), rangeSize, and blockLimit (latest or genesis, inclusive upper or lower bound).
 * @returns The calculated fromBlock and toBlock range, or null if no valid range exists above startBlock.
 */
export const getBlockRange = (params: RangeCalculatorParameters & { direction: "backward" | "forward" }): BlockRange | null => {
    return params.direction === "backward" ? getBackwardBlockRange(params) : getForwardBlockRange(params);
};

/**
 * Determines the start block for the *next* batch search based on the *queried* range and direction.
 * This block should be just outside the range that was just processed.
 * This function is used *internally* to know where to look for the *next batch*.
 * It does NOT determine the start block for the *next page*.
 *
 * @param queriedRange - The block range {fromBlock, toBlock} that was just successfully queried.
 * @param direction - The search direction ("backward" or "forward").
 * @returns The block number to start the next batch search from (exclusive of the queried range).
 */
export function determineNextSearchBlock(
    queriedRange: BlockRange, // Use the BlockRange type
    direction: "backward" | "forward"
): bigint {
    if (direction === "backward") {
        // The next search should start one block before the 'fromBlock' of the current range.
        return queriedRange.fromBlock - 1n;
    } else { // direction === "forward"
        // The next search should start one block after the 'toBlock' of the current range.
        return queriedRange.toBlock + 1n;
    }
}

/**
 * Adjusts the range size for the *next* batch fetch based on the number of items found in the *previous* batch.
 * Applies multipliers/dividers and min/max constraints defined in the fetcher configuration.
 * Uses simplified float multiplication/division with bigint by scaling to handle fractional adjustments.
 *
 * @param currentRangeSize - The current block range size.
 * @param numItemsInBatch - The number of items returned by the last batch fetch.
 * @param config - The fetcher configuration with adjustment parameters (min/max size, multipliers/dividers, threshold).
 * Using Required<Pick<...>> ensures these properties are present and not undefined.
 * @returns The new calculated range size (guaranteed to be >= 1n).
 */
export function adjustRangeSize(
    currentRangeSize: number,
    numItemsInBatch: number,
    config: Required<BlockRangePagerConfig>
): number {
    const { multiplierOnZero, multiplierOnLow, dividerOnHigh, highActivityThreshold, minRangeSize, maxRangeSize, lowActivityThreshold } = config;

    let newRangeSize = currentRangeSize;

    // Scaling factor to handle float multiplication/division with BigInt
    const SCALE = 100; // Use a constant for the scale factor

    if (numItemsInBatch === 0) {
        // Multiply by multiplierOnZero if no items found in the batch
        const multiplierScaled = Math.floor(multiplierOnZero * SCALE);
        if (multiplierScaled > 0) {
            newRangeSize = (currentRangeSize * multiplierScaled) / SCALE;
        }

    } else if (numItemsInBatch >= highActivityThreshold) {
        // Divide by dividerOnHigh if high activity detected in the batch
        const dividerScaled = Math.floor(dividerOnHigh * SCALE);
        if (dividerScaled > 0) {
            newRangeSize = (newRangeSize * SCALE) / dividerScaled;
        }
    } else if (numItemsInBatch < lowActivityThreshold) {
        // Multiply by multiplierOnLow if low activity detected in the batch
        const multiplierScaled = Math.floor(multiplierOnLow * SCALE);
        if (multiplierScaled > 0) {
            newRangeSize = (currentRangeSize * multiplierScaled) / SCALE;
        }
    };

    // Apply min/max limits to the new range size
    newRangeSize = Math.min(newRangeSize, maxRangeSize);
    newRangeSize = Math.max(newRangeSize, minRangeSize);


    // Ensure the range size is at least 1 block
    if (newRangeSize <= 0) newRangeSize = 1;

    // Return the new range size as integer to facilitate bigint conversion
    return Math.floor(newRangeSize);
}

/**
 * Checks if the search has reached the definitive limit based on the current search block.
 * This limit is defined by the blockLimit configuration.
 * @param currentSearchBlock - The block number where the next batch search would start.
 * @returns True if the limit is reached, false otherwise.
 * @private
 */
export function isBlockLimitReached(block: bigint, direction: "backward" | "forward", blockLimit: bigint): boolean {
    if (direction === "backward") return block < blockLimit;
    return block > blockLimit;
}

/**
 * Determines the start block for the *next* batch search based on the *queried* range and direction.
 * This block should be just outside the range that was just processed.
 * This function is used *internally* by the fetcher's loop to know where to look for the *next batch*.
 * It does NOT determine the start block for the *next page*.
 *
 * @param queriedRange - The block range {fromBlock, toBlock} that was just successfully queried.
 * @param direction - The search direction ("backward" or "forward").
 * @returns The block number to start the next batch search from (exclusive of the queried range).
 */
export function getNextStartBlock(
    queriedRange: BlockRange, // Use the BlockRange type
    direction: "backward" | "forward"
): bigint {
    if (direction === "backward") {
        // The next search should start one block before the 'fromBlock' of the current range.
        return queriedRange.fromBlock - 1n;
    } else { // direction === "forward"
        // The next search should start one block after the 'toBlock' of the current range.
        return queriedRange.toBlock + 1n;
    }
}