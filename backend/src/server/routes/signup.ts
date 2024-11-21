import express from 'express';
import { createToken, hashPassword, Token } from '../../utils/auth';
import { prisma } from '../../prisma';
import jwtDecode from 'jwt-decode';

const signup = express.Router();

signup.post('/', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const userData = {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
    };

    const existingEmail = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const savedUser = await prisma.user.create({
      data: userData,
    });

    if (savedUser) {
      const token = createToken(savedUser);
      const { exp: expiresAt } = jwtDecode<Token>(token);

      const { id, name, email } = savedUser;

      const userInfo = {
        id,
        name,
        email,
      };

      return res.json({
        message: 'User created!',
        token,
        userInfo,
        expiresAt,
      });
    } else {
      return res.status(400).json({
        message: 'There was a problem creating your account',
      });
    }
  } catch (err: any) {
    console.log(err.stack);
    return res.status(400).json({
      message: 'There was a problem creating your account',
    });
  }
});

export default signup;
