import type { IUserRepository } from "@/lib/db/repositories/interfaces";
import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { User } from "@/lib/types/user";

export class JsonUserRepository implements IUserRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findByUsername(username: string): Promise<User | null> {
    const db = await this.database.read();
    const employee = db.t_employee.find((user) => user.LOGIN_NAME === username && user.DISABLED_FLAG === 0 && user.DELETED_FLAG === 0);
    if (!employee) return null;
    return {
      id: String(employee.EMPLOYEE_ID),
      name: employee.ACTUAL_NAME,
      username: employee.LOGIN_NAME,
      role: employee.ADMINISTRATOR_FLAG === 1 ? "admin" : "user",
      department: String(employee.DEPARTMENT_ID),
    };
  }
}
