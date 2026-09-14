import { describe, expect, it } from "vitest";
import { PasswordService } from "~/server/service/password-service";

describe("PasswordService", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await PasswordService.hash("test-password-123");
    expect(await PasswordService.verify("test-password-123", hash)).toBe(true);
    expect(await PasswordService.verify("wrong-password", hash)).toBe(false);
  });

  it("rejects short passwords", async () => {
    await expect(PasswordService.hash("short")).rejects.toThrow(
      "Password must be at least 8 characters",
    );
  });
});
