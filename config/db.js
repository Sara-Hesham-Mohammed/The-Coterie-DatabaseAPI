import env from "dotenv";
import neo4j from "neo4j-driver";
import { User } from "../dataclasses/User.js";
import { Event } from "../dataclasses/Event.js";

env.config({
  path: "./config/.env",
});

// Replace with your Neo4j AuraDB credentials
const URI = process.env.AURA_DB_URI;
const USER = process.env.AURA_DB_USER;
const PASSWORD = process.env.AURA_DB_PASS;

// Create a Neo4j driver instance
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function testConnection(session) {
  const result = await session.run(
    'RETURN "Connected to Neo4j AuraDB!" AS message'
  );
  console.log(result.records[0].get("message"));
}

// fix this to match whatever data you want
async function addNewMember(session, user) {
  if (!(user instanceof User)) {
    throw new Error('Member must be an instance of User class');
  }

  const result = await session.run(
    `CREATE (m:Member {
      userID: $userID,
      name: $name,
      dateOfBirth: $dateOfBirth,
      gender: $gender,
      location: $location,
      phoneNumber: $phoneNumber,
      email: $email
    }) RETURN m`,
    {
      userID: user.userID,
      name: user.name,
      dateOfBirth: user.dateOfBirth.toISOString(),
      gender: user.gender,
      location: JSON.stringify(user.location),
      phoneNumber: user.phoneNumber,
      email: user.email
    }
  );
  console.log("New Member added:", result.records[0].get("m").properties);
  return result.records[0].get("m").properties;
}

// Update FIX IT TO BE A DYNAMIC UPDATE FN 
async function updateMember(session, id, name) {
  await session.run(
    "MATCH (m:Member {id: $id}) SET m.name = $name RETURN m",
    { id, name }
  );
}

// DELETE
async function removeMember(session, mID) {
  const result = await session.run(
    `MATCH (m:Member) WHERE m.id = $id DETACH DELETE m RETURN m`,
    { id: mID }
  );
  console.log("Removed Member:", result.records[0]?.get("m")?.properties);
}

async function createFriendship(session, memberX, memberY) {
  const result = await session.run(
    `MATCH (m:Member {name: $nameX}), (p:Member {name:$nameY})
          CREATE (m)-[r:IS_FRIENDS_WITH]->(p)
           RETURN m, p, r;`,
    { nameX: memberX.name, nameY: memberY.name }
  );
  console.log("Added Friend:", result.records[0].get("p").properties);
}

async function attendEvent(session, member, event) {
  const result = await session.run(
    `MATCH (m:Member {name: $name}), (e:Event {name: $eventName})
          CREATE (m)-[r:ATTENDED]->(e)
          RETURN m, e, r;`,
    { name: member.name, eventName: event.name }
  );
  console.log(
    "Event attendance recorded:",
    result.records[0].get("m").properties
  );
}

async function getFriendsOfFriends(session, member, event) {
  const result = await session.run(
    `MATCH (m:Member {name: $name}), (e:Event {name: $eventName})
          CREATE (m)-[r:ATTENDED]->(e)
          RETURN m, e, r;`,
    { name: member.name, eventName: event.name }
  );
  console.log(
    "Event attendance recorded:",
    result.records[0].get("m").properties
  );
}

/******************************** EVENTS FNS *********************************/
// fix this to match whatever data you want
async function addNewEvent(session, event) {
  if (!(event instanceof Event)) {
    throw new Error('Event must be an instance of Event class');
  }

  const result = await session.run(
    `CREATE (e:Event {
      id: $id,
      name: $name,
      location: $location
    }) RETURN e`,
    {
      id: event.id,
      name: event.name,
      location: JSON.stringify(event.location)
    }
  );
  console.log("New Event added:", result.records[0].get("e").properties);
  return result.records[0].get("e").properties;
}

async function removeEvent(session, eID) {
  const result = await session.run(
    `MATCH (e:Event) WHERE e.id = $id DETACH DELETE e RETURN e`,
    { id: eID }
  );
  console.log("Removed Event:", result.records[0]?.get("e")?.properties);
}

async function query(session) {
  const result = await session.run("MATCH (c:Customer) RETURN c LIMIT 5");
  // You can process result here if needed
}

// Close the driver when the app exits
process.on("exit", async () => {
  await driver.close();
  console.log("Neo4j driver closed");
});

export {
  testConnection,
  addNewMember,
  updateMember,
  addNewEvent,
  removeMember,
  removeEvent,
  createFriendship,
  attendEvent,
  getFriendsOfFriends,
  query,
  driver
};
