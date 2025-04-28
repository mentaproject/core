/**
* @internal
* Extracts an element from a ReadonlyArray based on its 'name' property.
*/
export type FindElementByName<
    TArray extends ReadonlyArray<{ name?: string }>,
    TName extends string
> = Extract<TArray[number], { name: TName }>;

/**
* @internal
* Recursively filters elements from a tuple type based on a condition,
* preserving the tuple structure (important for `as const` ABIs).
*/
export type FilterTupleElements<
    TTuple extends ReadonlyArray<any>,
    TCondition
> = TTuple extends readonly [infer THead, ...infer TTail]
    ? THead extends TCondition
    ? [THead, ...FilterTupleElements<TTail, TCondition>]
    : FilterTupleElements<TTail, TCondition>
    : [];

/**
 * @internal
 * Defines the type for transaction options applicable only to payable functions.
 */
export type RenameProperty<T, OldKey extends keyof T, NewKey extends string> = {
    [K in keyof T as K extends OldKey ? NewKey : K]: T[K]
};