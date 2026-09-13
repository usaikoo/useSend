import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  env: {
    SHOPIFY_API_KEY: undefined as string | undefined,
    SHOPIFY_THEME_EXTENSION_UID: undefined as string | undefined,
  },
}));

vi.mock("~/env", () => ({ env: mocks.env }));

import {
  buildThemeEditorAppEmbedUrl,
  getShopHandle,
  RIOREPLY_APP_EMBED_HANDLE,
} from "~/server/shopify/theme-editor";

describe("theme editor deep link", () => {
  beforeEach(() => {
    mocks.env.SHOPIFY_API_KEY = undefined;
    mocks.env.SHOPIFY_THEME_EXTENSION_UID = undefined;
  });

  it("extracts shop handle from myshopify domain", () => {
    expect(getShopHandle("larashopone.myshopify.com")).toBe("larashopone");
  });

  it("builds theme editor app embed URL", () => {
    mocks.env.SHOPIFY_API_KEY = "test-api-key";

    expect(buildThemeEditorAppEmbedUrl("larashopone.myshopify.com")).toBe(
      `https://admin.shopify.com/store/larashopone/themes/current/editor?context=apps&activateAppId=test-api-key%2F${RIOREPLY_APP_EMBED_HANDLE}`,
    );
  });

  it("uses theme extension UID when configured", () => {
    mocks.env.SHOPIFY_API_KEY = "test-api-key";
    mocks.env.SHOPIFY_THEME_EXTENSION_UID = "uuid-from-partner-dashboard";

    expect(buildThemeEditorAppEmbedUrl("larashopone.myshopify.com")).toContain(
      "activateAppId=test-api-key%2Fuuid-from-partner-dashboard",
    );
  });
});
