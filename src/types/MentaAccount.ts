import { Address, Chain } from "..";
import { Transport } from ".";
import { SmartAccount, WebAuthnAccount } from "../account-abstraction";
import { SmartAccountClient } from "permissionless";
import { Erc7579Actions } from "permissionless/actions/erc7579";

export interface MentaAccountParams {
  signer: WebAuthnAccount;
  /** Transport for ERC-4337 bundler calls */
  bundlerTransport: Transport;
  /** Transport for standard Ethereum RPC calls (eth_getBlock, etc.) */
  publicTransport: Transport;
  /** Validator address for the account */
  validatorAddress: Address;
}

export type MentaAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
> = SmartAccountClient<Transport, TChain, SmartAccount> &
  Erc7579Actions<SmartAccount>;
