import { MentaAccountClient, MentaAccountParams } from "../types";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { createRoutedTransport } from "../utils/createRoutedTransport";
import type { Client, Transport, Chain, Account } from "viem";
import { entryPoint07Address } from "../account-abstraction";

export async function createMentaAccount<TChain extends Chain | undefined>(
  client: Client<Transport, TChain, Account | undefined>,
  params: MentaAccountParams,
): Promise<MentaAccountClient<TChain>> {
  const kernel = await toKernelSmartAccount({
    owners: [params.signer],
    client: client as any,
    validatorAddress: params.validatorAddress,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
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
    chain: client.chain,
  }).extend(erc7579Actions()) as MentaAccountClient<TChain>;
}
