/**
 * ABI-related TypeScript types for generating typed contract interactions.
 */
import type { AbiItem, Log, AbiEvent, AbiFunction, AbiParameter, AbiParameterToPrimitiveType, Hex, AbiError, TransactionOptions } from "./index";
import type { FindElementByName, FilterTupleElements } from "./Utils";

// =============================================================================
// Core ABI Transformation Types
// =============================================================================

/**
* Transforms an ABI parameters array (inputs/outputs/error args) into a
* TypeScript object type with named properties and corresponding primitive types.
* Ignores parameters without a 'name'.
*
* @example `[{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }] -> { to: Address, amount: bigint }`
*/
export type AbiInputsToArgsObject<
  TAbiParameters extends ReadonlyArray<AbiParameter>
> = {
    // Iterate only over parameter names that are valid strings
    [K in Extract<TAbiParameters[number]['name'], string>]-?: AbiParameterToPrimitiveType<
      FindElementByName<TAbiParameters, K>
    >
  };

/**
* Determines the TypeScript return type based on an ABI 'outputs' array.
* Handles void (`[]`) and single primitive returns (`[AbiParameter]`).
* Multiple outputs are simplified to return the type of the first output by default.
* Consider using `AbiInputsToArgsObject<Outputs>` for named tuple-like returns if needed.
*
* @example `[] -> void`
* @example `[{ type: 'bool' }] -> boolean`
* @example `[{ type: 'address' }, { type: 'uint256' }] -> Address` (simplified)
*/
export type AbiOutputsToReturnType<
  TAbiParameters extends ReadonlyArray<AbiParameter>
> = TAbiParameters extends readonly [] // No outputs?
  ? void
  : TAbiParameters extends readonly [infer TSingleOutput extends AbiParameter] // Single output?
  ? AbiParameterToPrimitiveType<TSingleOutput>
  : TAbiParameters[0] extends AbiParameter // Multiple outputs?
  // Default: return type of the first output
  ? AbiParameterToPrimitiveType<TAbiParameters[0]>
  : unknown; // Fallback (shouldn't be reached with proper constraints)


// =============================================================================
// Function-Specific Types
// =============================================================================

/**
 * Creates the TypeScript signature for an asynchronous contract function.
 * Handles different signatures based on inputs and state mutability (including payable value).
 */
export type AbiFunctionToSignature<
    TAbiFunction extends AbiFunction
> = TAbiFunction extends { // Utilise l'inférence pour extraire inputs/outputs de manière robuste
        inputs: infer TInputs extends ReadonlyArray<AbiParameter>;
        outputs: infer TOutputs extends ReadonlyArray<AbiParameter>;
    }
    ? TAbiFunction['stateMutability'] extends 'view' | 'pure'
        // --- Read-only Functions ---
        ? TInputs extends readonly [] // Uses TInputs (inferred)
            ? () => Promise<AbiOutputsToReturnType<TOutputs>> // Uses TOutputs (inferred)
            : (args: AbiInputsToArgsObject<TInputs>) => Promise<AbiOutputsToReturnType<TOutputs>>
        // --- State-Changing Functions ---
        : TInputs extends readonly [] // Uses TInputs (inferred)
            ? (options?: TransactionOptions) => Promise<Hex>
            : ( // Uses TInputs (inferred)
                  args: AbiInputsToArgsObject<TInputs>,
                  options?: TransactionOptions
              ) => Promise<Hex>
    : never; // Should not happen if TAbiFunction extends AbiFunction correctly

/**
 * Utility type to extend a base object `T` with typed methods corresponding
 * to each function defined in the `TFunctionAbis` array.
 * The resulting type is `T & { functionName: FunctionSignature; ... }`.
 */
export type AddFunctions<
  T extends object,
  TFunctionAbis extends ReadonlyArray<AbiFunction>
> = T & {
  // Map each function name to its corresponding signature type (using the updated AbiFunctionToSignature)
  [K in TFunctionAbis[number]['name']]: AbiFunctionToSignature<
    Extract<TFunctionAbis[number], { name: K }>
  >
};


// =============================================================================
// Event-Specific Types
// =============================================================================

/**
* Creates the TypeScript type for an event handler callback based on an AbiEvent definition.
* The handler receives a Viem `Log` object augmented with a typed `args` property.
* Signature: `(log: Log & { args: EventArgsObject }) => void`
*/
export type AbiEventToHandler<
  TAbiEvent extends AbiEvent
> = (
  // Combines the standard Log structure with the specific typed args for this event
  log: Log & { args: AbiInputsToArgsObject<TAbiEvent['inputs']> }
) => void;


/**
* Transforms an array of AbiEvent definitions into an object map where keys are
* event names and values are the corresponding typed event handler signatures (`AbiEventToHandler`).
* Useful for defining type-safe event listener maps.
*
* @example `[TransferAbi, ApprovalAbi] -> { Transfer: HandlerForTransfer, Approval: HandlerForApproval }`
*/
export type AbiEventsToHandlers< // Kept name as requested
  TEventAbis extends ReadonlyArray<AbiEvent>
> = {
    // Map each event name to its corresponding handler type
    [K in TEventAbis[number]['name']]: AbiEventToHandler<
      Extract<TEventAbis[number], { name: K }>
    >
  };

// =============================================================================
// Error-Specific Types
// =============================================================================

/**
* Represents a decoded custom contract error, containing its name and typed arguments.
*
* @template TErrorAbi The specific AbiError definition.
*/
export type DecodedContractError<TErrorAbi extends AbiError> = {
  errorName: TErrorAbi['name'];
  args: AbiInputsToArgsObject<TErrorAbi['inputs']>;
};

/**
* Creates a discriminated union of all possible decoded error types derived from
* an array of AbiError definitions. Allows type narrowing based on `errorName`.
*
* @template TErrorAbis Array of AbiError definitions.
*/
export type DecodedContractErrorUnion<
  TErrorAbis extends ReadonlyArray<AbiError>
> = TErrorAbis extends ReadonlyArray<infer TErrorAbi extends AbiError>
  ? DecodedContractError<TErrorAbi> // Map each AbiError to its DecodedContractError type
  : never;

/**
* Defines the return type for a function that decodes contract error data based
* on a mixed ABI. Returns the specific decoded error object or null if the data
* does not match any known custom error in the ABI.
*
* @template TAbi The full mixed ABI array for the contract.
*/
export type DecodeErrorResultReturnType<
  TAbi extends ReadonlyArray<AbiItem>
> = DecodedContractErrorUnion<FilterAbiByType<TAbi, 'error'>> | null; // Union of all possible decoded errors | null


// =============================================================================
// ABI Filtering Type
// =============================================================================

/**
* Filters an array/tuple of AbiItem objects (functions, events, errors etc.)
* to include only items of a specific ABI type (e.g., 'function', 'event'),
* preserving the tuple structure if the input was a tuple (e.g., from `as const`).
*/
export type FilterAbiByType<
  TAbis extends ReadonlyArray<AbiItem>,
  TType extends AbiItem['type'] // The ABI type to filter for (e.g. 'function', 'event', 'error')
> = FilterTupleElements<TAbis, { type: TType }>;