import { getAddress, slice } from ".";
import { Address, Hex } from "../types";

/**
 * Helper function to convert a bytes value to an address.
 * @param bytes The bytes value to convert.
 * @param startByteIndex The index of the first byte to extract from the bytes value.
 * @returns The address or undefined if the conversion failed.
 */
export const bytesToAddress = (bytes: Hex, startByteIndex: number): Address | undefined => {
    try {
        // Extract 20 bytes (40 hex chars) starting from the specified index
        // startByteIndex * 2 for hex chars, +2 to account for '0x' prefix
        const addressBytes = slice(bytes, startByteIndex, startByteIndex + 20);
        return getAddress(addressBytes); // Format and checksum
    } catch (e) {
        return undefined; // Handle potential slicing or formatting errors
    }
};

/**
 * Helper function to convert a bytes32 value to an address.
 * @param bytes The bytes32 value to convert.
 * @returns The address or undefined if the conversion failed.
 */
export const bytes32ToAddress = (bytes: Hex): Address | undefined => {
    return bytesToAddress(bytes, -20);
};