import express from 'express';
import { createToken, Token, verifyPassword } from '../../utils/auth';
import { prisma } from '../../prisma';
import jwtDecode from 'jwt-decode';

const login = express.Router();

login.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Wrong email or password.',
      });
    }
    const passwordValid = await verifyPassword(password, user.password);

    if (passwordValid) {
      const { ...userInfo } = user;
      const token = createToken(userInfo);

      const decodedToken = jwtDecode<Token>(token);
      const { exp: expiresAt } = decodedToken;

      return res.json({
        message: 'Authentication successful!',
        token,
        userInfo,
        expiresAt,
      });
    } else {
      return res.status(403).json({
        message: 'Wrong email or password.',
      });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Something went wrong.' });
  }
});

export default login;
