import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { generateOpaqueToken, hashToken } from './token';

export { generateOpaqueToken, hashToken };

export interface AccessTokenPayload {
  sub: string; // user id
  role: 'farmer' | 'buyer';
}

export function signAccessToken(payload: AccessTokenPayload): string {
  // JWT_ACCESS_EXPIRY is validated at boot (config/env.ts) but is a plain
  // `string` to zod/TS, while jsonwebtoken's types want its own narrower
  // `StringValue` template-literal type — this cast is safe because the env
  // value is always one of jsonwebtoken's own accepted formats (e.g. "15m").
  const options: jwt.SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}
