import bcrypt from 'bcrypt';
import User from '../schema/user.js';
import { isValidObjectId } from '../utils/validation.js';

export async function login(req, res) {
  try {
    const { login_name, password } = req.body;

    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(400).send('Bad login name or password');
    }

    const result = await bcrypt.compare(password, user.password_digest);
    if (!result) {
      return res.status(400).send('Bad login name or password');
    }

    req.session.user = user._id;
    const { password_digest, ...userWithoutPassword } = user.toObject();
    return res.json(userWithoutPassword);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).send('Logout failed');
    }
    return res.json({ message: 'Logout successful' });
  });
}

export async function me(req, res) {
  try {
    const userId = req.session.user;
    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const user = await User.findById(userId, '_id first_name last_name location description occupation login_name').lean();
    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
