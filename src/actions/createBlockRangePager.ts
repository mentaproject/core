import { PaginatedResult } from "../structures/PaginatedResult";
import { onBlockRangeCallback, BlockRangePagerConfig, PaginatableItem, PaginationState, createBlockRangePagerParameters } from "../types/Pagination";
import { getPage } from "../utils/pagination/pages";

/**
 * Creates a pager to iterate over blockranges. Blockranges are dynamically adjusted based on the provided configuration
 * and how many items are found per batch.
 * 
 * If the actual blockrange return too many items, the pager will automatically reduce the range size for the next batch.
 * If the actual blockrange return too few items, the pager will automatically increase the range size for the next batch.
 * 
 * This method is optimized to maximize efficiency by fetching items and minimizing the charge on the RPC node by
 * asking too many items per batch or too many batches per seconds.
 * 
 * Useful for methods like `eth_getLogs` or `trace_filter` that iterate over blocks to find items.
 *
 * @template T - The type of items to paginate, must extend PaginatableItem.
 * @param config - The configuration for fetching blocks (e.g., start/end block number).
 * @param onBlockRange - The callback function to execute for each block range to fetch items.
 * @param itemsPerPage - The desired number of items per page.
 * @param paginationState - The initial pagination state (used for fetching subsequent pages).
 * 
 * @returns  A promise that resolves with a PaginatedResult object containing the first page of items and a function to fetch the next page.
 */
export async function createBlockRangePager<T extends PaginatableItem>(
    params: createBlockRangePagerParameters,
    onBlockRange: onBlockRangeCallback<T>,
    paginationState?: PaginationState
): Promise<PaginatedResult<T>> {
    const { itemsPerPage, startBlock, blockLimit, direction, options } = params;
    const state = paginationState ?? { startBlock, startIndexInBlock: undefined, hasMore: true };

    const config: BlockRangePagerConfig = {
        initialRangeSize: options?.initialRangeSize ?? 10,
        minRangeSize: options?.minRangeSize ?? 1,
        maxRangeSize: options?.maxRangeSize ?? 100_000_000,
        multiplierOnZero: options?.multiplierOnZero ?? 2,
        multiplierOnLow: options?.multiplierOnLow ?? 1.5,
        dividerOnHigh: options?.dividerOnHigh ?? 2,
        highActivityThreshold: options?.highActivityThreshold ?? itemsPerPage * 1.2,
        lowActivityThreshold: options?.lowActivityThreshold ?? itemsPerPage * 0.8,
        direction: direction,
        blockLimit: blockLimit,
        itemsPerPage: itemsPerPage,
    }

    const page = await getPage<T>(config, onBlockRange, state);
    
    return new PaginatedResult<T>(page.items, page.nextPaginationState, async () => {
        // Recursively fetch the next page
        return await createBlockRangePager(params, onBlockRange, page.nextPaginationState);
    });
}