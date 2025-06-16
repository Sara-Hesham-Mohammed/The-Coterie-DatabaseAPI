import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { User } from "./DataClasses/User.js";
import { Event } from "./DataClasses/Event.js";

// Import the database connection function
import {
  testConnection,
  addNewUser,
  addNewEvent,
  removeUser,
  removeEvent,
  createFriendship,
  attendEvent,
  getFriendsOfFriends,
  // query,
  driver,
} from "./config/db.js";

// App setup
const app = express();
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3001', 'http://10.0.2.2:3001', 'http://98.66.138.229:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("HI FROM DB");
});

app.get("/recommendations", async (req, res) => {
  res.send("RECOMMENDATIONS SHOULD SHOW UP HERE");
});

app.get("/all-users", async (req, res) => {
  await sessionManage(async (session) => {
    // query for all users
    res.send("All users endpoint");
  });
});

// Create User
app.post("/users", async (req, res) => {
  const { id, name, country, age } = req.body;
  let user = new User(id, name, country, age);
  await sessionManage(async (session) => {
    await addNewUser(user);
    res.sendStatus(201);
  });
});

// Update User
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await sessionManage(async (session) => {
    await updateUser(id, { name });
    res.sendStatus(200);
  });
});

// Delete User
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await sessionManage(async (session) => {
    await removeUser(id);
    res.sendStatus(200);
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  //init server first THEN DB....for obvious reasons
  console.log(`Listening on port ${PORT}`);
  await testConnection();
});

// App failsafes? ig
app.use((req, res, next) => {
  console.log("Request received");
  next();
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

async function sessionManage(callback) {
  const session = driver.session();
  try {
    await callback(session);
  } catch (error) {
    console.error("Error in session:", error);
  } finally {
    await session.close();
  }
}
