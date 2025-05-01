import { onBlockRangeCallback, FetchPageResult, BlockRangePagerConfig, PaginatableItem, PaginationState, } from "../../types/Pagination";
import { adjustRangeSize, getBlockRange, getNextStartBlock, isBlockLimitReached } from "./blockRange";

/**
 * Prepares the final FetchPageResult based on the collected items and the end state.
 * Calculates the next pagination state, including the precise start block and index if applicable.
 * 
 * @param foundItemsThisPage - All items collected from batch fetches for this page.
 * @param itemsPerPage - The target number of items for the page.
 * @param hasMore - Flag indicating if there are potentially more items for the next page.
 * @returns The FetchPageResult containing the sliced items and the next pagination state.
 * @private
 */
export function formatGetPageResult<T extends PaginatableItem>(
    foundItemsThisPage: T[],
    itemsPerPage: number,
    hasMore: boolean
): FetchPageResult<T> {
    // Extract the exact number of items requested for this page
    const itemsForPage: T[] = foundItemsThisPage.slice(0, itemsPerPage);

    // Determine the state for the *next* page fetch.
    // The `start_block` and `start_index_in_block` for the *next* page are based on the *last item* included in *this* page,
    // but only if there *is* a next page (`hasMore` is true).
    // If `hasMore` is false, the next state indicates the end (start_block: null).
    let nextStartBlock: bigint | null = null;
    let nextStartIndexInBlock: number | undefined = undefined;

    if (hasMore && itemsForPage.length > 0) {
        // If there's a next page AND this page has items, the next page starts
        // right after the last item of THIS page.
        const lastItemOfPage = itemsForPage[itemsForPage.length - 1];
        nextStartBlock = lastItemOfPage.blockNumber;
        nextStartIndexInBlock = lastItemOfPage.index; // Use 'index' property
    } else {
        // If hasMore is false (either endReached or not enough items found to fill the page),
        // the next state indicates the end.
        nextStartBlock = null;
        nextStartIndexInBlock = undefined;
    }

    const nextPageState: PaginationState = {
        startBlock: nextStartBlock,
        startIndexInBlock: nextStartIndexInBlock,
        hasMore: hasMore
    };

    return {
        items: itemsForPage,
        nextPaginationState: nextPageState
    };
};

/**
 * Initializes the internal fetcher state based on the provided initial pagination state.
 * 
 * @param initialPaginationState - The state from the previous page, or null/undefined for the first page.
 * @returns An object containing the initial currentSearchBlock, startIndexInBlock, and whether the end was reached immediately.
 * @private
 */
export function initPaginationState(config: BlockRangePagerConfig, initialPaginationState: PaginationState | null | undefined): PaginationState & { startBlock: bigint } {
    let startBlock: bigint;
    let startIndexInBlock: number | undefined = undefined;
    let hasMore: boolean = true;

    // If a start_block is provided in the initial state, use it.
    if (initialPaginationState?.startBlock !== null && initialPaginationState?.startBlock !== undefined) {
        startBlock = initialPaginationState.startBlock;
        // Also capture the index if provided.
        startIndexInBlock = initialPaginationState.startIndexInBlock;

        if (config.direction === "backward" && startBlock < config.blockLimit) {
            hasMore = false; // Cannot start before blockLimit (genesis or user-provided) in backward mode
        } else if (config.direction === "forward" && startBlock > config.blockLimit) {
            hasMore = false; // Cannot start after blockLimit (latest or user-provided) in forward mode
        }
    } else {
        // If start_block is null or undefined in the initial state, it means there are no more pages.
        // Set hasMore to false and provide a sentinel value for startBlock.
        startBlock = config.direction === "backward" ? config.blockLimit - 1n : config.blockLimit + 1n;
        hasMore = false;
    }

    return { startBlock, startIndexInBlock, hasMore };
}

/**
 * Fetches items by making multiple batch requests with dynamically adjusted block ranges
 * until enough items are collected for a full page or the search limit is reached.
 * It handles resuming from a specific item index within a block if provided in the initial state.
 * 
 * @param fetchBatchCallback - The user-provided async function to fetch data for a single block range.
 * @param itemsPerPage - The target number of items to return for this logical "page".
 * @param initialPaginationState - The state object from the *previous* page, indicating where to resume the search.
 * Pass null or undefined for the very first page fetch.
 * @param callbackParams - Additional parameters to pass to the fetchBatchCallback.
 * 
 * @returns A Promise resolving to `FetchPageResult<T>`, containing the items found for the page
 * and the necessary state (`PaginationState`) to fetch the next page.
 */
export async function getPage<T extends PaginatableItem>(
    config: BlockRangePagerConfig,
    fetchBatchCallback: onBlockRangeCallback<T>,
    initialPaginationState: PaginationState | undefined, // Receive the full state, allow undefined for first call
): Promise<FetchPageResult<T>> {

    let foundItemsThisPage: T[] = [];
    let currentRangeSize = config.initialRangeSize;

    let { startBlock, startIndexInBlock, hasMore } = initPaginationState(config, initialPaginationState);

    let isFirstBatchInPageFetch = true;

    while (foundItemsThisPage.length < config.itemsPerPage && hasMore) {

        const blockRange = getBlockRange({
            startBlock: startBlock!,
            rangeSize: currentRangeSize,
            blockLimit: config.blockLimit,
            direction: config.direction
        });

        // If calculateBatchRange returned null, it means no valid range can be formed from currentSearchBlock
        if (!blockRange) {
            hasMore = false;
            break;
        }

        const { fromBlock, toBlock } = blockRange;

        let batchItems: T[] = [];

        batchItems = await fetchBatchCallback({ fromBlock, toBlock });

        // --- Filter items if this is the first batch and we need to resume from an index ---
        if (isFirstBatchInPageFetch && startIndexInBlock !== undefined && batchItems.length > 0) {
            batchItems = batchItems.filter(item =>
                // Keep the item if:
                // 1. It is NOT in the specific block where we need to resume by index OR
                // 2. It IS in that block AND its index is strictly GREATER than the resume index.
                item.blockNumber !== startBlock ||
                (item.blockNumber === startBlock && item.index > startIndexInBlock!)
            );
        }

        isFirstBatchInPageFetch = false;
        foundItemsThisPage.push(...batchItems);

        startBlock = getNextStartBlock(blockRange, config.direction);
        hasMore = !isBlockLimitReached(startBlock, config.direction, config.blockLimit);

        // Adjust the block range size for the *next* batch request based on the current batch's result count
        if (hasMore) {
            currentRangeSize = adjustRangeSize(currentRangeSize, batchItems.length, config);
        }

    }

    return formatGetPageResult(foundItemsThisPage, config.itemsPerPage, hasMore);
}