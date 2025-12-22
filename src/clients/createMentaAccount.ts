import { MentaAccountParams } from "../types";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { createRoutedTransport } from "../utils/createRoutedTransport";
import type { Client, Transport, Chain, Account } from "viem";

export async function createMentaAccount<TChain extends Chain | undefined>(
  client: Client<Transport, TChain, Account | undefined>,
  params: MentaAccountParams,
) {
  // Get the WebAuthnAccount from the signer
  // The signer must have a toWebAuthnAccount() method that returns
  // a viem-compatible WebAuthnAccount
  if (!("toWebAuthnAccount" in params.signer)) {
    throw new Error(
      "Signer must have a toWebAuthnAccount() method. " +
        "Make sure you're using @mentaproject/signer-react-native >= 0.0.17"
    );
  }

  const webAuthnAccount = (params.signer as any).toWebAuthnAccount();

  const kernel = await toKernelSmartAccount({
    owners: [webAuthnAccount],
    client: client as any,
    version: "0.3.3",
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
