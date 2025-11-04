import { env } from "../env";

export const OPENAPI_VERSION = "3.1.0";

export const OPENAPI_INFO = {
  title: "Resource Server API (MVP)",
  version: "0.1.0",
};

export const OPENAPI_SERVERS = env.OPENAPI_SERVER_URLS.map((url) => ({
  url: url.replace(/\/$/, "") + env.RESOURCE_API_BASE_PATH,
}));
