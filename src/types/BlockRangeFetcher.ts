/**
 * Represents a range of blocks.
 * @property fromBlock - The starting block number.
 * @property toBlock - The ending block number.
 */
export type BlockRange = { fromBlock: bigint; toBlock: bigint; };

/**
 * Callback function to be executed for each block range.
 * @param blockRange - The current block range being processed.
 * @param stop - A function to stop the fetching process.
 * @returns A promise that resolves with an array of items found in the block range.
 */
export type onBlockRangeCallback = (blockRange: BlockRange, stop: () => void) => Promise<any[]>;

/**
 * Parameters for fetching data within a range of blocks.
 */
export type FetchBlockRangeParameters= {
    /** The starting block number. */
    fromBlock: bigint;
    /** The ending block number. */
    toBlock: bigint;
    /** The direction to fetch the blocks, either "backward" or "forward". */
    direction: "backward" | "forward";
    /** The maximum number of items to fetch. */
    itemLimit: number;
    /** The callback function to be executed for each block range. */
    onBlockRange: onBlockRangeCallback;
    /** Optional parameters to control the range fetching behavior. */
    options?: {
        /** The divider to use when activity is high. */
        dividerOnHigh: number;
        /** The multiplier to use when activity is low. */
        multiplierOnLow: number;
        /** The multiplier to use when activity is zero. */
        multiplierOnZero: number;
        /** The threshold for high activity. */
        highActivityThreshold: number;
        /** The threshold for low activity. */
        lowActivityThreshold: number;
        /** The initial size of the block range. */
        initialRangeSize: number;
        /** The maximum size of the block range. */
        maxRangeSize: number;
        /** The minimum size of the block range. */
        minRangeSize: number;
    };
}