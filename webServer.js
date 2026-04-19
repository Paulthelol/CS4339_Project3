import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';


// Used when you implement the TODO handlers below.
// eslint-disable-next-line no-unused-vars
import User from './schema/user.js';
// eslint-disable-next-line no-unused-vars
import Photo from './schema/photo.js';

const app = express();

app.use(session({
  secret: 'none',
  resave: false,
  saveUninitialized: false
}));


// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project2';


// Enable CORS for frontend running on a different port
app.use(cors());

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).send('Unauthorized');
}

app.post('/admin/login', async (req, res) => {
  const { login_name, password } = req.body;

  const user = users.find((u) => u.login_name === login_name);

  if (!user) {
    return res.status(400).send('Bad login name or password');
  }

  bcrypt.compare(password, user.password_digest, (err, result) => {
    if (err) {
      return res.status(400).send('Error comparing passwords');
    }
    if (!result) {
      return res.status(400).send('Bad login name or password');
    }
    req.session.user = user._id;

    const { password_digest, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

});

app.post('/admin/logout', isAuthenticated, (req, res) => {
  // TODO: Implement admin logout logic
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).send('Logout failed');
    }
    return res.json({ message: 'Logout successful' });
  });
});

app.post('/user', (req, res) => {
  // TODO: Implement user creation logic
  const { first_name, last_name, location, description, occupation, login_name, password } = req.body;

  if (!first_name || !last_name || !login_name || !password) {
    return res.status(400).send('Missing required fields');
  }

  const existingUser = users.find((u) => u.login_name === login_name);

  if (existingUser) {
    return res.status(400).send('Login name already exists');
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(400).send('Error hashing password');
    }
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password_digest: hash
    };
    users.push(newUser);
    return res.status(201).json({ _id: newUser._id, first_name, last_name, location, description, occupation, login_name });
  });
});

app.get('/admin/me', isAuthenticated, async (req, res) => {
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
});

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/user/list', isAuthenticated, async (req, res) => {
  try {
    // TODO:
    // 1. Fetch all users from MongoDB.
    // 2. Return only the fields required by the frontend.
    const users = await User.find({}, '_id first_name last_name').lean();

    if (!users) {
      return res.status(404).send('No users found');
    }

    return res.json(users);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    // TODO:
    // 1. Find the user by id.
    // 2. If the user does not exist, return 404.
    // 3. Return only the fields required by the frontend.
    const user = await User.findById(userId, '_id first_name last_name location description occupation').lean();

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    // TODO:
    // 1. Find all photos whose user_id matches userId.
    // 2. Fetch all users from MongoDB.
    // 3. Build a lookup structure from user _id to user object.
    // 4. For each photo, construct the response expected by the frontend.
    // 5. For each comment, include the corresponding user object in comment.user.
    // 6. Return the resulting array.
    const users = await User.find({}, '_id first_name last_name').lean();
    if (!users) {
      return res.status(404).send('No users found');
    }

    const photos = await Photo.find({ user_id: userId }).lean();
    if (!photos) {
      return res.json([]);
    }

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
    });

    const responsePhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userMap[comment.user_id?.toString()] || null,
      })),
    }));


    return res.json(responsePhotos);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
