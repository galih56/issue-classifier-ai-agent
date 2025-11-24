import { createDbClient } from "@repo/database";
import { env } from "./env";

export const db = createDbClient(env.DATABASE_URL);
