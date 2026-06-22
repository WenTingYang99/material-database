export interface User {
  id: string;
  name: string;
  username: string;
  role: "admin" | "user";
  department?: string;
}

export interface SessionUser {
  name: string;
  role: "admin" | "user";
  department?: string;
}
