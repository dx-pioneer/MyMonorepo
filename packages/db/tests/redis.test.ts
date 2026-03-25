import { describe, it, expect } from "vitest";
import { createRedisClient } from "../src/redis";

describe("createRedisClient", () => {
  it("should create a Redis instance", () => {
    const client = createRedisClient();
    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
    expect(typeof client.set).toBe("function");
    client.disconnect();
  });

  it("should create a Redis instance with custom options", () => {
    const client = createRedisClient({ db: 1 });
    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
    client.disconnect();
  });
});
