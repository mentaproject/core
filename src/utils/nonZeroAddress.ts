import { zeroAddress } from "..";
import { Address } from "../types";

export const nonZeroAddress = (address: Address): Address | undefined => address === zeroAddress ? undefined : address;