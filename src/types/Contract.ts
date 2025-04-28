import type { AbiItem, Address } from "@/types";
import type { AbiEventsToHandlers, AddFunctions, FilterAbiByType } from "@/types/Abi";

import { Contract } from "@/structures";

/**
 * Defines the parameters for the `getContract` factory function.
 * Contains the mixed ABI array and the contract address.
 *
 * @template Abi The type of the mixed ABI array.
 */
export type GetContractParameters<Abi extends ReadonlyArray<AbiItem> = ReadonlyArray<AbiItem>> = {
   abi: Abi;
   address: Address;
};

/**
 * Calculates the final return type for the `getContract` factory function,
 * based on the definition of Contract<P> which stores the mixed ABI.
 * Combines the `Contract<P>` type with the filtered function signatures.
 *
 * @template P The type of parameters passed to getContract (contains the mixed ABI).
 */
export type GetContractReturnType<
    P extends GetContractParameters // Takes the parameters type P
> = AddFunctions< // Adds function signatures...
        Contract<P>, // ...to the Contract<P> type (which takes P as a generic)...
        FilterAbiByType<P['abi'], 'function'> // ...using the filtered functions from P['abi'].
    >;

/**
 * Calculates the type of the event handlers map ({ EventName: HandlerType })
 * from a given mixed ABI array.
 * First filters the events, then creates the handlers map.
 *
 * @template TAbi The type of the mixed ABI array.
 */
export type AbiToContractEventsHandlers<
    TAbi extends ReadonlyArray<AbiItem>
> = AbiEventsToHandlers< // Creates the handlers map...
        FilterAbiByType<TAbi, 'event'> // ...from the filtered events of the mixed ABI TAbi.
    >;