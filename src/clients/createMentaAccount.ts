import {
  PasskeyValidatorContractVersion,
  toPasskeyValidator,
} from "@zerodev/passkey-validator";
import { MentaAccountParams } from "../types";
import { entryPoint07Address } from "../account-abstraction";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { createRoutedTransport } from "../utils/createRoutedTransport";
import type { Client, Transport, Chain, Account } from "viem";

export async function createMentaAccount<TChain extends Chain | undefined>(
  client: Client<Transport, TChain, Account | undefined>,
  params: MentaAccountParams,
) {
  const validator = await toPasskeyValidator(client as any, {
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
    client: client as any,
  });

  // Create a routed transport that sends bundler methods to the bundler
  // and all other RPC calls to the public transport
  const routedTransport = createRoutedTransport(
    params.publicTransport,
    params.bundlerTransport,
  );

  return createSmartAccountClient({
    account: kernel,
    bundlerTransport: routedTransport,
  }).extend(erc7579Actions());
}
