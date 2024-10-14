import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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

export const hashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate a salt at level 12 strength
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

export const verifyPassword = (attempt: string, encrypted: string) =>
  bcrypt.compare(attempt, encrypted);
