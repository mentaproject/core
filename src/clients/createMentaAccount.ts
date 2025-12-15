import {
  PasskeyValidatorContractVersion,
  toPasskeyValidator,
} from "@zerodev/passkey-validator";
import { CoreClient, MentaAccountParams } from "../types";
import { entryPoint07Address } from "../account-abstraction";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";

export async function createMentaAccount(
  coreClient: CoreClient,
  params: MentaAccountParams,
) {
  const validator = await toPasskeyValidator(coreClient, {
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
    client: coreClient as any,
  });

  return createSmartAccountClient({
    account: kernel,
    chain: params.chain,
    bundlerTransport: params.bundlerTransport,
  }).extend(erc7579Actions());
}
