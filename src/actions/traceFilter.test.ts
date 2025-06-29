import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { traceFilter } from "./traceFilter";
import type { CoreClient, TraceFilterParameters, TraceFilterReturnType } from "../types";

describe("traceFilter", () => {
  // Créer un mock du client qui satisfait le type CoreClient.
  // La méthode `request` est celle que nous allons espionner/mocker.
  const mockClient = {
    request: jest.fn(),
  } as unknown as CoreClient;

  // Réinitialiser les mocks avant chaque test pour garantir l'isolation.
  beforeEach(() => {
    (mockClient.request as jest.Mock).mockReset();
  });

  /**
   * Teste si la fonction appelle `client.request` avec les bons paramètres
   * et retourne le résultat attendu en cas de succès.
   */
  it("should call client.request with the correct parameters and return the result", async () => {
    const mockParams: TraceFilterParameters = {
      fromBlock: '0x1',
      toBlock: '0x2',
      fromAddress: ["0xfromAddress"],
    };
    const mockResult: TraceFilterReturnType = [{
        type: 'call',
        action: { from: '0xfrom', to: '0xto', gas: '0x1', input: '0x', value: '0x0' },
        result: { gasUsed: '0x1', output: '0x' },
        traceAddress: [],
        subtraces: 0,
        blockHash: '0xblockhash',
        blockNumber: 1,
        transactionHash: '0xthash',
        transactionPosition: 0,
        error: undefined
    }];

    (mockClient.request as jest.Mock<any>).mockResolvedValue(mockResult);

    const result = await traceFilter(mockClient, mockParams);

    expect(result).toEqual(mockResult);
    expect(mockClient.request).toHaveBeenCalledTimes(1);
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'trace_filter',
      params: [mockParams],
    });
  });

  /**
   * Teste la conversion des adresses `fromAddress` et `toAddress`
   * d'une chaîne de caractères vers un tableau de chaînes.
   */
  it("should convert fromAddress and toAddress from string to string[]", async () => {
    const mockParams: TraceFilterParameters = {
      fromBlock: '0x1',
      toBlock: '0x2',
      fromAddress: "0xfromAddress",
      toAddress: "0xtoAddress",
    };
    
    const expectedParamsInCall = {
      ...mockParams,
      fromAddress: ["0xfromAddress"],
      toAddress: ["0xtoAddress"],
    };

    (mockClient.request as jest.Mock<any>).mockResolvedValue([]);

    await traceFilter(mockClient, mockParams);

    expect(mockClient.request).toHaveBeenCalledTimes(1);
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'trace_filter',
      params: [expectedParamsInCall],
    });
  });

  /**
   * Teste que les adresses déjà fournies en tant que tableaux ne sont pas modifiées.
   */
  it("should not modify addresses if they are already arrays", async () => {
    const mockParams: TraceFilterParameters = {
        fromBlock: '0x1',
        toBlock: '0x2',
        fromAddress: ["0xaddress1", "0xaddress2"],
        toAddress: ["0xaddress3"],
    };

    (mockClient.request as jest.Mock<any>).mockResolvedValue([]);

    await traceFilter(mockClient, { ...mockParams });

    expect(mockClient.request).toHaveBeenCalledWith({
        method: 'trace_filter',
        params: [mockParams],
    });
  });

  /**
   * Teste la gestion des erreurs lorsque l'appel `client.request` échoue.
   */
  it("should throw an error if client.request fails", async () => {
    const mockParams: TraceFilterParameters = {
      fromBlock: '0x1',
      toBlock: '0x2',
    };
    const mockError = new Error("RPC Error");

    (mockClient.request as jest.Mock<any>).mockRejectedValue(mockError);

    await expect(traceFilter(mockClient, mockParams)).rejects.toThrow(mockError);
  });
});