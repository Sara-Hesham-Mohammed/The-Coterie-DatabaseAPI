import express from "express";
import dotenv from "dotenv";

import { Member } from "./DataClasses/User.js";
import { Event } from "./DataClasses/Event.js";

// Import the database connection function
import {
  testConnection,
  addNewMember,
  addNewEvent,
  removeMember,
  removeEvent,
  createFriendship,
  attendEvent,
  getFriendsOfFriends,
  query,
  driver,
} from "./config/db.js";



// App setup
const app = express();
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT;

app.get("/", async (req, res) => {
  res.send("HI FROM DB");
});

app.get("/recommendations", async (req, res) => {
  res.send("RECOMMENDATIONS SHOULD SHOW UP HERE");
});

app.get("/all-members", async (req, res) => {
  await sessionManage(async (session) => {
    // query for all memebers
    res.send("All members endpoint");
  });
});

// Create Member
app.post("/members", async (req, res) => {
  const { id, name, country, age } = req.body;
  let member = Member(id, name, country, age);
  await sessionManage(async (session) => {
    await addNewMember(name, country, age, session);
    res.sendStatus(201);
  });
});

// Update Member
app.put("/members/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await sessionManage(async (session) => {
    await updateMember(id, name, session);
    res.sendStatus(200);
  });
});

// Delete Member
app.delete("/members/:id", async (req, res) => {
  const { id } = req.params;
  await sessionManage(async (session) => {
    await removeMember(id, session);
    res.sendStatus(200);
  });
});

app.listen(PORT, async () => {
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
