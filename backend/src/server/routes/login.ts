import express from 'express';
import {createToken, Token, verifyPassword} from '../../utils/auth';
import {User} from '../../entity/User';
import {getRepository} from 'typeorm';
import jwtDecode from 'jwt-decode';

const login = express.Router();

login.post('/', async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await getRepository(User).findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message: 'Wrong email or password.',
      });
    }

    const passwordValid = await verifyPassword(password, user.password);

    if (passwordValid) {
      const {password, ...userInfo} = user;
      const token = createToken(userInfo);

      const decodedToken = jwtDecode<Token>(token);
      const {exp: expiresAt} = decodedToken;

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
    console.log(err);
    return res.status(400).json({message: 'Something went wrong.'});
  }
});

export default login;
