import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../schema/user.js';
import { isValidObjectId } from '../utils/validation.js';

export async function createUser(req, res) {
  try {
    const {
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password,
    } = req.body;

    if (!first_name || !last_name || !login_name || !password) {
      return res.status(400).send('Missing required fields');
    }

    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send('Login name already exists');
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password_digest: hash,
    };

    await User.create(newUser);
    return res.status(200).json({
      _id: newUser._id,
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function listUsers(req, res) {
  try {
    const users = await User.find({}, '_id first_name last_name').lean();
    if (!users) {
      return res.status(404).send('No users found');
    }

    return res.json(users);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const user = await User.findById(userId, '_id first_name last_name location description occupation').lean();
    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
