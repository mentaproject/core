/**
 * Defines common options for sending a transaction (write operations).
 */
export type TransactionOptions = {
    /** Amount of Ether (in wei) to send with the transaction (only applies to payable functions) */
    value?: bigint;
    /** Gas limit for the transaction */
    gas?: bigint;
    /** Nonce for the transaction */
    nonce?: number;
    // Potentially add gasPrice, maxFeePerGas, maxPriorityFeePerGas etc. based on tx type needed
};