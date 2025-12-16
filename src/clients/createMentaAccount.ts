import {
  PasskeyValidatorContractVersion,
  toPasskeyValidator,
} from "@zerodev/passkey-validator";
import { MentaAccountParams } from "../types";
import { entryPoint07Address } from "../account-abstraction";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";
import type {
  Client,
  Transport,
  Chain,
  JsonRpcAccount,
  LocalAccount,
} from "viem";

export async function createMentaAccount<TChain extends Chain | undefined>(
  client: Client<Transport, TChain, JsonRpcAccount | LocalAccount | undefined>,
  params: MentaAccountParams,
) {
  const validator = await toPasskeyValidator(client, {
    webAuthnKey: params.signer,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    kernelVersion: "0.3.3",
    validatorContractVersion: PasskeyValidatorContractVersion.V0_0_3_PATCHED,
  });

  const kernel = await toKernelSmartAccount({
    owners: [validator],
    client: client,
  });

  return createSmartAccountClient({
    account: kernel,
    bundlerTransport: params.bundlerTransport,
  }).extend(erc7579Actions());
}
