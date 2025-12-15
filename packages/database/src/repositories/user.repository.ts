import { asc, eq } from "drizzle-orm";
import { createDbClient } from "../client";
import * as schema from "../schema";

let dbInstance: ReturnType<typeof createDbClient> | null = null;

function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    dbInstance = createDbClient(connectionString);
  }
  return dbInstance;
}

export type UserRecord = typeof schema.users.$inferSelect;
export type NewUserRecord = typeof schema.users.$inferInsert;

export async function listUsers(): Promise<UserRecord[]> {
  const db = getDb();
  return db.select().from(schema.users).orderBy(asc(schema.users.createdAt));
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const db = getDb();
  return db.query.users.findFirst({ where: eq(schema.users.id, id) });
}

export async function getUserByEmail(
  email: string,
): Promise<UserRecord | undefined> {
  const db = getDb();
  return db.query.users.findFirst({ where: eq(schema.users.email, email) });
}

export async function createUser(data: NewUserRecord): Promise<UserRecord> {
  const db = getDb();
  const [row] = await db.insert(schema.users).values(data).returning();
  if (!row) {
    throw new Error("Failed to create user");
  }
  return row;
}

export async function updateUserById(
  id: string,
  data: Partial<Pick<UserRecord, "name" | "email" | "emailVerified" | "role">>,
): Promise<UserRecord | undefined> {
  const db = getDb();
  const [row] = await db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.id, id))
    .returning();
  return row;
}

export async function deleteUserById(id: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .delete(schema.users)
    .where(eq(schema.users.id, id))
    .returning({ id: schema.users.id });
  return Boolean(row);
}

export function resetUserDbInstance() {
  dbInstance = null;
}
