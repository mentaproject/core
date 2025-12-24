import { Address } from "..";
import { Transport } from ".";
import { createMentaAccount } from "../clients";
import { WebAuthnAccount } from "src/account-abstraction";

export interface MentaAccountParams {
  signer: WebAuthnAccount;
  /** Transport for ERC-4337 bundler calls */
  bundlerTransport: Transport;
  /** Transport for standard Ethereum RPC calls (eth_getBlock, etc.) */
  publicTransport: Transport;
  /** Validator address for the account */
  validatorAddress: Address;
}

export type MentaAccountClient = Awaited<ReturnType<typeof createMentaAccount>>;
