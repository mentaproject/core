import type { EIP1193RequestFn, Transport } from "viem";

/**
 * RPC methods that should be routed to the bundler.
 * All other methods will be routed to the public RPC.
 */
const BUNDLER_METHODS = new Set([
  // ERC-4337 standard methods
  "eth_sendUserOperation",
  "eth_estimateUserOperationGas",
  "eth_getUserOperationByHash",
  "eth_getUserOperationReceipt",
  "eth_supportedEntryPoints",
  // Pimlico-specific methods
  "pimlico_getUserOperationGasPrice",
  "pimlico_getUserOperationStatus",
  "pimlico_sendCompressedUserOperation",
  // pm_ paymaster methods (used by some bundlers)
  "pm_getPaymasterData",
  "pm_getPaymasterStubData",
  "pm_sponsorUserOperation",
  "pm_validateSponsorshipPolicies",
]);

/**
 * Creates a transport that routes requests between a public RPC and a bundler RPC.
 *
 * Bundler-specific methods (ERC-4337) are routed to the bundler transport,
 * while all other methods (eth_getBlockByNumber, eth_call, etc.) are routed
 * to the public transport.
 *
 * @param publicTransport - Transport for standard Ethereum RPC calls
 * @param bundlerTransport - Transport for ERC-4337 bundler calls
 * @returns A unified transport that routes requests appropriately
 *
 * @example
 * import { http } from 'viem';
 * import { createRoutedTransport } from '@mentaproject/core/utils';
 *
 * const transport = createRoutedTransport(
 *   http('https://eth-mainnet.g.alchemy.com/v2/...'),
 *   http('https://api.pimlico.io/v2/1/rpc?apikey=...')
 * );
 */
export function createRoutedTransport(
  publicTransport: Transport,
  bundlerTransport: Transport,
): Transport {
  return (params) => {
    const publicClient = publicTransport(params);
    const bundlerClient = bundlerTransport(params);

    const request: EIP1193RequestFn = async ({ method, params: reqParams }) => {
      if (BUNDLER_METHODS.has(method)) {
        return bundlerClient.request({ method, params: reqParams } as any);
      }
      return publicClient.request({ method, params: reqParams } as any);
    };

    return {
      ...publicClient,
      request,
    };
  };
}
