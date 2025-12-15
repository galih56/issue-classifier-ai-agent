import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env";
import { forbidden, unauthorized } from "./errors";

const JWKS = createRemoteJWKSet(new URL(env.JWKS_URL));

export interface JWTPayload {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  id?: string;
  email?: string;
  scp?: string[];
}

export const jwtMiddleware = createMiddleware<{
  Variables: {
    jwtPayload: JWTPayload;
  };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(c, "Missing or invalid Authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    c.set("jwtPayload", payload as JWTPayload);
    await next();
  } catch (error) {
    if (error instanceof Error) {
      return unauthorized(c, "Token verification failed", {
        reason: error.message,
      });
    }
    return unauthorized(c, "Token verification failed");
  }
});

export function requireScope(requiredScope: string) {
  return createMiddleware(async (c, next) => {
    const payload = c.get("jwtPayload");
    const scopes = payload?.scp || [];
    
    if (!scopes.includes(requiredScope)) {
      return forbidden(c, "Insufficient permissions", {
        required: requiredScope,
        provided: scopes,
      });
    }

    await next();
  });
}
