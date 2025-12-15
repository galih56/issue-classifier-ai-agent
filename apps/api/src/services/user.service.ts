import {
  createUser,
  deleteUserById,
  getUserById,
  listUsers,
  updateUserById,
  type NewUserRecord,
  type UserRecord,
} from "@repo/database/repositories";

export class UserService {
  static async getUsers(): Promise<UserRecord[]> {
    return listUsers();
  }

  static async getUserById(id: string): Promise<UserRecord | undefined> {
    return getUserById(id);
  }

  static async createUser(
    data: Pick<NewUserRecord, "name" | "email" | "emailVerified" | "role">,
  ): Promise<UserRecord> {
    // Generate ID for the new user
    const id = crypto.randomUUID();
    return createUser({
      id,
      ...data,
    });
  }

  static async updateUser(
    id: string,
    data: Partial<Pick<UserRecord, "name" | "email" | "emailVerified" | "role">>,
  ): Promise<UserRecord | undefined> {
    return updateUserById(id, data);
  }

  static async deleteUser(id: string): Promise<boolean> {
    return deleteUserById(id);
  }
}
