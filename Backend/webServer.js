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

app.get("/health", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).send("ok");
  }

  return res.status(503).send("database not ready");
});

app.use(
  session({
    secret: "none",
    resave: false,
    saveUninitialized: false,
  }),
);

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

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
