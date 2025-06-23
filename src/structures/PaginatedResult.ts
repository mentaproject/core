import { PaginationState, FetchNextPageCallback, PaginatableItem } from '../types/Pagination';

/**
 * Represents a single page of results from a paginated query.
 * Provides the items for the current page and a method to fetch the next page.
 * It wraps the raw items and the state needed for the next fetch operation.
 * The type parameter T must extend PaginatableItem to support item-based pagination.
 */
export class PaginatedResult<T extends PaginatableItem> { // Apply the constraint here
    public readonly items: T[];
    private readonly paginationState: PaginationState; // State for the *next* page
    public readonly hasNextPage: boolean;
    private readonly _fetchNextPageCallback: FetchNextPageCallback<T>; // Function to get the next page

    /**
     * @param items - The items for the current page (should already be sliced to page size).
     * @param nextPaginationState - The state object required to fetch the page *after* this one.
     * @param fetchNextPageCallback - An async function () => Promise<PaginatedResult<T> | null> that encapsulates the logic to fetch the next page.
     */
    constructor(items: T[], nextPaginationState: PaginationState, fetchNextPageCallback: FetchNextPageCallback<T>) {
        this.items = items;
        this.paginationState = nextPaginationState;
        // hasNextPage is true if the paginationState indicates there might be more data
        this.hasNextPage = nextPaginationState.hasMore;
        this._fetchNextPageCallback = fetchNextPageCallback;
    }

    /**
     * Asynchronously fetches the next page of results.
     * @returns A Promise resolving to a new PaginatedResult instance for the next page,
     * or null if there are no more pages (`hasNextPage` is false).
     */
    async getNextPage(): Promise<PaginatedResult<T> | null> {
        if (!this.hasNextPage) {
            // If the current page's state indicates no more pages, return null immediately.
            return null;
        }
        // Call the stored callback function, which internally calls the service's pagination method again.
        return await this._fetchNextPageCallback();
    }

    /**
     * Returns the raw pagination state needed to potentially resume fetching later.
     * Useful for bookmarking progress or serializing/deserializing state.
     */
    getPaginationState(): PaginationState {
        return this.paginationState;
    }
}
