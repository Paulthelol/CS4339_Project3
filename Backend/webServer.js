import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import "dotenv/config";

const app = express();

app.use(express.json());

// If running behind a proxy (Render, Heroku, etc.) trust the first proxy
// so express-session can set secure cookies when the connection is TLS.
const isProd = process.env.NODE_ENV === 'production';
if (isProd) app.set('trust proxy', 1);

app.get("/health", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).send("ok");
  }

  return res.status(503).send("database not ready");
});

// Ensure session cookies are configured for cross-site usage when in production.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'none',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // requires HTTPS; must be true when SameSite=None
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
// Normalize CLIENT_ORIGIN (strip trailing slash) to avoid CORS mismatches
const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');

// Enable CORS for frontend running on a different port
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.options("*", cors({ origin: clientOrigin, credentials: true }));

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:"),
);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(adminRoutes);
app.use(userRoutes);

// commentsOfPhoto will be implemented here
app.use(photoRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
