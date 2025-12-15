import { LocalAccount } from "..";
import { Transport, Chain, Hash } from ".";

export interface PasskeySigner extends LocalAccount {
  pubX: bigint;
  pubY: bigint;
  authenticatorId: string;
  authenticatorIdHash: Hash;
  rpID: string;
}

export interface MentaAccountParams {
  signer: PasskeySigner;
  chain: Chain;
  bundlerTransport: Transport;
}
