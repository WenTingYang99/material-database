import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/types/user";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-material-library-secret");

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    name: user.name,
    role: user.role,
    department: user.department,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      name: String(payload.name || ""),
      role: payload.role === "admin" ? "admin" : "user",
      department: payload.department ? String(payload.department) : undefined,
    };
  } catch {
    return null;
  }
}
