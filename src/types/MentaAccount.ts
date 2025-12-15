import { LocalAccount } from "..";
import { Transport, Chain, Hash } from ".";
import { createMentaAccount } from "src/clients/createMentaAccount";

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

export type MentaAccountClient = Awaited<ReturnType<typeof createMentaAccount>>;
