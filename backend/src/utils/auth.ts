import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {NextFunction, Response} from 'express';
import {User} from '../entity/User';
import {Request} from '../server/types';
import app from '../server/app';

export interface Token {
  subject: number;
  email: string;
  role: string;
  issuer: string;
  audience: string;
  iat: number;
  exp: number;
}

export const createToken = ({id, role, email}: Omit<User, 'password'>) => {
  // Sign the JWT
  if (!role) {
    throw new Error('No user role specified');
  }
  return jwt.sign(
    {
      subject: id,
      email: email,
      role: role,
      issuer: 'api.muttle',
      audience: 'api.muttle',
    },
    app.get('secret'),
    {algorithm: 'HS256', expiresIn: '1h'}
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

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'There was a problem authorizing the request',
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(401).json({message: 'Insufficient role'});
  }
  return next();
};
