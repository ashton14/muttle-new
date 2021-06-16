import express from 'express';
import {createToken, hashPassword, Token} from '../../utils/auth';
import {User} from '../../entity/User';
import {getRepository} from 'typeorm';
import jwtDecode from 'jwt-decode';

const signup = express.Router();

signup.post('/', async (req, res) => {
  try {
    const userRepo = await getRepository(User);
    const {email, firstName, lastName, password} = req.body;
    const hashedPassword = await hashPassword(password);

    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: hashedPassword,
      role: 'admin', // TODO - probably shouldn't create everyone as admins
    };

    const existingEmail = await userRepo.findOne({
      email: userData.email,
    });

    if (existingEmail) {
      return res.status(400).json({message: 'Email already exists'});
    }

    const savedUser = await userRepo.save(userData);

    if (savedUser) {
      const token = createToken(savedUser);
      const {exp: expiresAt} = jwtDecode<Token>(token);

      const {id, firstName, lastName, email, role} = savedUser;

      const userInfo = {
        id,
        firstName,
        lastName,
        email,
        role,
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
  } catch (err) {
    console.log(err.stack);
    return res.status(400).json({
      message: 'There was a problem creating your account',
    });
  }
});

export default signup;
