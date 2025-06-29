import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { fetchByBlockRange } from "./fetchByBlockRange";
import { BlockRange, FetchBlockRangeParameters, onBlockRangeCallback } from "../types/BlockRangeFetcher";

describe("fetchByBlockRange", () => {
  const onBlockRangeMock = jest.fn<onBlockRangeCallback>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data in a forward direction", async () => {
    onBlockRangeMock.mockResolvedValueOnce(["item1", "item2"]);
    onBlockRangeMock.mockResolvedValueOnce(["item3"]);

    const params: FetchBlockRangeParameters = {
      fromBlock: 1000n,
      toBlock: 1200n,
      direction: "forward",
      itemLimit: 1000,
      onBlockRange: onBlockRangeMock,
      options: {
        initialRangeSize: 100,
        maxRangeSize: 1000,
        minRangeSize: 1,
        dividerOnHigh: 2,
        multiplierOnLow: 1.5,
        multiplierOnZero: 2,
        highActivityThreshold: 50,
        lowActivityThreshold: 10,
      },
    };

    const result = await fetchByBlockRange(params);

    expect(result).toEqual(["item1", "item2", "item3"]);
    // The loop terminates once the `toBlock` is reached.
    // 1. First call: 1000 -> 1100. Range size: 100. Returns 2 items (low activity).
    //    New range size: 100 * 1.5 = 150.
    // 2. Second call: next block is 1101. The range would be [1101, 1101 + 150 = 1251],
    //    but it's capped by the global `toBlock` of 1200.
    expect(onBlockRangeMock).toHaveBeenCalledTimes(2);
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      1,
      { fromBlock: 1000n, toBlock: 1100n },
      expect.any(Function)
    );
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      2,
      // The range is capped by the `toBlock` parameter
      { fromBlock: 1101n, toBlock: 1200n },
      expect.any(Function)
    );
  });

  it("should fetch data in a backward direction", async () => {
    onBlockRangeMock.mockResolvedValueOnce(["item1", "item2"]);
    onBlockRangeMock.mockResolvedValueOnce(["item3"]);

    const params: FetchBlockRangeParameters = {
      fromBlock: 1200n,
      toBlock: 1000n,
      direction: "backward",
      itemLimit: 1000,
      onBlockRange: onBlockRangeMock,
      options: {
        initialRangeSize: 100,
        maxRangeSize: 1000,
        minRangeSize: 1,
        dividerOnHigh: 2,
        multiplierOnLow: 1.5,
        multiplierOnZero: 2,
        highActivityThreshold: 50,
        lowActivityThreshold: 10,
      },
    };

    const result = await fetchByBlockRange(params);

    expect(result).toEqual(["item1", "item2", "item3"]);
    // The loop terminates once the `toBlock` is reached.
    // 1. First call: 1100 -> 1200. Range size: 100. Returns 2 items (low activity).
    //    New range size: 100 * 1.5 = 150.
    // 2. Second call: next block is 1099. The range would be [1099 - 150 = 949, 1099],
    //    but it's capped by the global `toBlock` of 1000.
    expect(onBlockRangeMock).toHaveBeenCalledTimes(2);
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      1,
      { fromBlock: 1100n, toBlock: 1200n },
      expect.any(Function)
    );
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      2,
      // The range is capped by the `toBlock` parameter
      { fromBlock: 1000n, toBlock: 1099n },
      expect.any(Function)
    );
  });

  it("should stop fetching when stop function is called", async () => {
    onBlockRangeMock.mockImplementation(async (blockRange: BlockRange, stop: () => void) => {
      if (blockRange.fromBlock === 1000n) {
        return ["item1"];
      }
      stop();
      return [];
    });

    const params: FetchBlockRangeParameters = {
      fromBlock: 1000n,
      toBlock: 2000n,
      direction: "forward",
      itemLimit: 1000,
      onBlockRange: onBlockRangeMock,
      options: {
        initialRangeSize: 100,
        maxRangeSize: 1000,
        minRangeSize: 1,
        dividerOnHigh: 2,
        multiplierOnLow: 1.5,
        multiplierOnZero: 2,
        highActivityThreshold: 50,
        lowActivityThreshold: 10,
      },
    };

    const result = await fetchByBlockRange(params);

    expect(result).toEqual(["item1"]);
    expect(onBlockRangeMock).toHaveBeenCalledTimes(2);
  });

  it("should handle API errors gracefully", async () => {
    const testError = new Error("API Error");
    onBlockRangeMock.mockRejectedValue(testError);

    const params: FetchBlockRangeParameters = {
      fromBlock: 1000n,
      toBlock: 1200n,
      direction: "forward",
      itemLimit: 1000,
      onBlockRange: onBlockRangeMock,
    };

    await expect(fetchByBlockRange(params)).rejects.toThrow(testError);
  });

  it("should handle empty block ranges", async () => {
    const params: FetchBlockRangeParameters = {
      fromBlock: 1000n,
      toBlock: 1000n,
      direction: "forward",
      itemLimit: 1000,
      onBlockRange: onBlockRangeMock.mockResolvedValue([]),
    };

    const result = await fetchByBlockRange(params);

    expect(result).toEqual([]);
    expect(onBlockRangeMock).toHaveBeenCalledTimes(1);
  });

  it("should adjust range size based on activity", async () => {
    // High activity
    onBlockRangeMock.mockResolvedValueOnce(Array(51).fill("item"));
    // Low activity
    onBlockRangeMock.mockResolvedValueOnce(Array(5).fill("item"));
    // Zero activity
    onBlockRangeMock.mockResolvedValueOnce([]);
    onBlockRangeMock.mockResolvedValue([]);

    const params: FetchBlockRangeParameters = {
      fromBlock: 1000n,
      toBlock: 1500n,
      direction: "forward",
      itemLimit: 1000,
      onBlockRange: onBlockRangeMock,
      options: {
        initialRangeSize: 100,
        highActivityThreshold: 50,
        lowActivityThreshold: 10,
        dividerOnHigh: 2,
        multiplierOnLow: 1.5,
        multiplierOnZero: 2,
        maxRangeSize: 10000,
        minRangeSize: 1,
      },
    };

    await fetchByBlockRange(params);

    // Initial call with range size 100
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      1,
      { fromBlock: 1000n, toBlock: 1100n },
      expect.any(Function)
    );
    // High activity -> rangeSize /= 2 -> 50
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      2,
      { fromBlock: 1101n, toBlock: 1151n },
      expect.any(Function)
    );
    // Low activity -> rangeSize *= 1.5 -> 75
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      3,
      { fromBlock: 1152n, toBlock: 1227n },
      expect.any(Function)
    );
    // Zero activity -> rangeSize *= 2 -> 150
    expect(onBlockRangeMock).toHaveBeenNthCalledWith(
      4,
      { fromBlock: 1228n, toBlock: 1378n },
      expect.any(Function)
    );
  });
  
  it("should stop fetching when itemLimit is reached", async () => {
    onBlockRangeMock.mockResolvedValueOnce(["item1", "item2"]);
    onBlockRangeMock.mockResolvedValueOnce(["item3"]);

    const params: FetchBlockRangeParameters = {
      fromBlock: 1000n,
      toBlock: 2000n,
      direction: "forward",
      itemLimit: 2,
      onBlockRange: onBlockRangeMock,
    };

    const result = await fetchByBlockRange(params);

    expect(result).toEqual(["item1", "item2"]);
    expect(onBlockRangeMock).toHaveBeenCalledTimes(1);
  });
});