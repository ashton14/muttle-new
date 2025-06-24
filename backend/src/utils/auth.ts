import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../server/app';
import { User } from '@prisma/client';

export interface Token {
  subject: number;
  email: string;
  issuer: string;
  audience: string;
  iat: number;
  exp: number;
}

export const createToken = ({ id, email }: Omit<User, 'password'>) => {
  return jwt.sign(
    {
      subject: id,
      email: email,
      issuer: 'api.muttle',
      audience: 'api.muttle',
    },
    app.get('secret'),
    { algorithm: 'HS256', expiresIn: '1h' }
  );
};

export const hashPassword = async (password: string): Promise<string> => {
  // Generate a salt at level 12 strength
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = (attempt: string, encrypted: string) =>
  bcrypt.compare(attempt, encrypted);
