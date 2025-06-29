import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { traceTransaction } from "./traceTransaction";
import type { CoreClient, TraceTransactionParameters, TraceTransactionReturnType, Hash } from "../types";

describe("traceTransaction", () => {
  // Créer un mock du client qui satisfait le type CoreClient.
  const mockClient = {
    request: jest.fn(),
  } as unknown as CoreClient;

  // Réinitialiser les mocks avant chaque test pour garantir l'isolation.
  beforeEach(() => {
    (mockClient.request as jest.Mock).mockClear();
  });

  /**
   * Teste si la fonction appelle `client.request` avec les bons paramètres
   * et retourne le résultat attendu en cas de succès.
   */
  it("should call client.request with the correct parameters and return the result", async () => {
    const mockTxHash: Hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const mockParams: TraceTransactionParameters = mockTxHash;
    
    const mockResult: TraceTransactionReturnType = [{
        type: 'call',
        action: { from: '0xfrom', to: '0xto', gas: '0x1', input: '0x', value: '0x0' },
        result: { gasUsed: '0x1', output: '0x' },
        traceAddress: [],
        subtraces: 0,
        blockHash: '0xblockhash',
        blockNumber: 1,
        transactionHash: mockTxHash,
        transactionPosition: 0,
        error: undefined
    }];

    (mockClient.request as jest.Mock<any>).mockResolvedValue(mockResult);

    const result = await traceTransaction(mockClient, mockParams);

    expect(result).toEqual(mockResult);
    expect(mockClient.request).toHaveBeenCalledTimes(1);
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'trace_transaction',
      params: [mockParams],
    });
  });

  /**
   * Teste la gestion des erreurs lorsque l'appel `client.request` échoue.
   */
  it("should throw an error if client.request fails", async () => {
    const mockTxHash: Hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockParams: TraceTransactionParameters = mockTxHash;
    const mockError = new Error("RPC Error");

    (mockClient.request as jest.Mock<any>).mockRejectedValue(mockError);

    await expect(traceTransaction(mockClient, mockParams)).rejects.toThrow(mockError);
  });
});