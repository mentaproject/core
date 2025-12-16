import { LocalAccount } from "..";
import { Transport, Chain, Hash } from ".";
import { createMentaAccount } from "../clients";

export interface PasskeySigner extends LocalAccount {
  pubX: bigint;
  pubY: bigint;
  authenticatorId: string;
  authenticatorIdHash: Hash;
  rpID: string;
}

export interface MentaAccountParams {
  signer: PasskeySigner;
  /** Transport for ERC-4337 bundler calls */
  bundlerTransport: Transport;
  /** Transport for standard Ethereum RPC calls (eth_getBlock, etc.) */
  publicTransport: Transport;
}

export type MentaAccountClient = Awaited<ReturnType<typeof createMentaAccount>>;
