import { getAddress, slice } from "viem";
import { Address, Hex } from "../types";

/**
 * Helper function to convert a bytes value to an address.
 * @param bytes The bytes value to convert.
 * @param startByteIndex The index of the first byte to extract from the bytes value.
 * @returns The address or undefined if the conversion failed.
 */
export const bytesToAddress = (bytes: Hex, startByteIndex: number): Address => {
  if (startByteIndex < 0)
    throw new Error(
      `startByteIndex must be greater than or equal to 0, got ${startByteIndex}`,
    );
  if (!bytes || bytes.length < startByteIndex + 20)
    throw new Error(
      `Bytes value must be at least ${startByteIndex + 20} characters long, got ${bytes?.length ?? 0}`,
    );

  // Extracts 20 bytes starting from startByteIndex
  const addressBytes = slice(bytes, startByteIndex, startByteIndex + 20);

  if (addressBytes.length !== 42)
    throw new Error(
      `Address bytes must be 42 characters long, got ${addressBytes.length}`,
    );
  return getAddress(addressBytes);
};

/**
 * Helper function to convert a bytes32 value to an address.
 * @param bytes The bytes32 value to convert.
 * @returns The address or undefined if the conversion failed.
 */
export const bytes32ToAddress = (bytes: Hex): Address => {
  if (!bytes || bytes.length !== 66)
    throw new Error(
      `Bytes32 value must be 66 characters long, got ${bytes?.length ?? 0}`,
    );

  return bytesToAddress(bytes, 12);
};
