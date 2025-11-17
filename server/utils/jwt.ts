import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateMagicLinkToken = (email: string): string => {
  return jwt.sign({ email, type: 'magic-link' }, JWT_SECRET, { expiresIn: '15m' });
};

export const verifyMagicLinkToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; type: string };
    if (decoded.type !== 'magic-link') {
      throw new Error('Invalid token type');
    }
    return decoded.email;
  } catch (error) {
    throw new Error('Invalid or expired magic link');
  }
};
