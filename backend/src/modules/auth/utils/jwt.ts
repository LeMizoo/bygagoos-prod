import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

interface AccessTokenPayload {
  id: string;
  email: string;
  role: string;
  jti: string;
}

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
}

const accessSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

const validateSecrets = () => {
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets not defined in environment variables');
  }
};

export const generateAccessToken = (id: string, email: string, role: string) => {
  validateSecrets();
  const payload: AccessTokenPayload = {
    id,
    email,
    role,
    jti: randomUUID(),
  };

  const expiresInValue: SignOptions['expiresIn'] = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'];

  const options: SignOptions = {
    expiresIn: expiresInValue,
  };

  return jwt.sign(payload, accessSecret, options);
};

export const generateRefreshToken = (id: string, tokenVersion: number) => {
  validateSecrets();
  const payload: RefreshTokenPayload = {
    id,
    tokenVersion,
  };

  const expiresInValue: SignOptions['expiresIn'] = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  const options: SignOptions = {
    expiresIn: expiresInValue,
  };

  return jwt.sign(payload, refreshSecret, options);
};

export const verifyAccessToken = (token: string) => {
  validateSecrets();
  return jwt.verify(token, accessSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  validateSecrets();
  return jwt.verify(token, refreshSecret) as RefreshTokenPayload;
};
