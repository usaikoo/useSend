const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

export const SITE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rioreply.app",
);

export const APP_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rioreply.app",
);

export const APP_SIGNUP_URL = `${APP_URL}/signup`;

export const API_EMAILS_URL = `${APP_URL}/api/v1/emails`;
