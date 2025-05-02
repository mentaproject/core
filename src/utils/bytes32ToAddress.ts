import { getAddress, hexToBigInt, slice } from ".";
import { zeroAddress } from "..";
import { Address, Hex } from "../types";

/**
 * Convertit une valeur bytes32 (potentiellement issue d'un slot de stockage) en adresse Ethereum.
 * Retourne l'adresse checksummée ou undefined si la valeur est nulle, zéro ou invalide.
 */
export const bytes32ToAddress = (bytes32Value: Hex | undefined | null): Address | undefined => {
    if (!bytes32Value || hexToBigInt(bytes32Value) === 0n) return undefined;

    // Extract the last 20 bytes from the bytes32 value
    const potentialAddress = getAddress(slice(bytes32Value, -20));

    return potentialAddress === zeroAddress ? undefined : potentialAddress;
};