import { PaginatedResult } from "../structures/PaginatedResult";

// =============================================================================
// Block Range Pager
// =============================================================================

export type createBlockRangePagerParameters = {
    /** The number of items to return per page. */
    itemsPerPage: number;
    /** The starting block number to fetch. */
    startBlock: bigint;
    /** The latest block number to search to. (e.g., latest block in forward, genesis block in backward) */
    blockLimit: bigint;
    /** The direction of the block search. */
    direction: "backward" | "forward";
    /** Optional configuration options for the pager. Recommended to modify in high-volume scenarios. */
    options?: {
        dividerOnHigh: number;
        multiplierOnLow: number;
        multiplierOnZero: number;
        highActivityThreshold: number;
        lowActivityThreshold: number;
        initialRangeSize: number;
        maxRangeSize: number;
        minRangeSize: number;
    };
};

export type BlockRangePagerConfig = {
    // Range size parameters

    /** The range of blocks to fetch in the first batch. */
    initialRangeSize: number;
    /** The minimum range size to fetch if the pager reduces the range too much. */
    minRangeSize: number;
    /** The maximum range size to fetch if the pager increases the range too much. */
    maxRangeSize: number;

    // Multiplier/divider parameters

    /** The multiplier to apply if the batch returns 0 items. */
    multiplierOnZero: number;
    /** The multiplier to apply if the batch returns few items. */
    multiplierOnLow: number;
    /** The divider to apply if the batch returns many items. */
    dividerOnHigh: number;

    // Other parameters

    /** The number of items needed to trigger a high activity threshold and reduce the range size. */
    highActivityThreshold: number;
    /** The number of items needed to trigger a low activity threshold and increase the range size. */
    lowActivityThreshold: number;
    /** The direction of the block search. */
    direction: "backward" | "forward";
    /** The latest block number to search to. (e.g., latest block in forward, genesis block in backward) */
    blockLimit: bigint;
    /** The number of items to return per page. */
    itemsPerPage: number;
};

// =============================================================================
// Block Range Related Types
// =============================================================================

export type RangeCalculatorParameters = {
    startBlock: bigint,
    rangeSize: number,
    blockLimit: bigint,
};

export type BlockRange = { fromBlock: bigint; toBlock: bigint; };

// =============================================================================
// Pages Related Types
// =============================================================================

/**
 * Represents an item that can be paginated using block number and an index within the block.
 * Any type T used with the fetcher for item-based pagination must implement this interface.
 * This allows the fetcher to precisely determine the resume point for the next page.
 */
export type PaginatableItem<T = {[key: string]: any}> = T & {
    blockNumber: bigint;
    // index: A property representing the item's order or unique identifier within its block.
    // This is crucial for resuming pagination from a specific item.
    index: number;
};


/**
 * Represents the state needed to fetch the next page of results.
 * This state is passed from one pagination call to the next.
 *
 * startBlock: The block number where the next search should begin.
 * If startIndexInBlock is also present, the search starts AFTER that index within this block.
 * Is null if there are no more blocks/items to search.
 *
 * startIndexInBlock: The index of the LAST item of the previous page *within* its block.
 * Used in conjunction with startBlock to resume precisely. Undefined if not applicable
 * (e.g., first page, or last page ended cleanly at a block boundary, or no items found).
 *
 * hasMore: Indicates if there are potentially more results beyond the current page based on the last fetch attempt.
 */
export interface PaginationState {
    startBlock: bigint | null; // Allow null to signal end
    startIndexInBlock?: number; // Optional property
    hasMore: boolean;
}

/**
 * The result structure returned by the getPage method.
 */
export interface FetchPageResult<T extends PaginatableItem> {
    items: T[];
    nextPaginationState: PaginationState;
}

// =============================================================================
// Callback Types
// =============================================================================

/**
 * Type for the specific callback function that performs the actual batch request to the data source.
 */
export type onBlockRangeCallback<T extends PaginatableItem = PaginatableItem> = (blockRange: BlockRange) => Promise<T[]>;

/**
 * Type for the function that will be stored in the PaginatedResult instance.
 */
export type FetchNextPageCallback<T extends PaginatableItem = PaginatableItem> = () => Promise<PaginatedResult<T> | null>;
