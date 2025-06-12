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

// CREATE - Add new member
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
      email: user.email,
      tags: user.tags || [],
      interests_embedding: user.interests || [],
      location_lang_embedding: user.location_lang_embedding || []

    }
  );
  console.log("New Member added:", result.records[0].get("m").properties);
  return result.records[0].get("m").properties;
}

// READ - Get member by ID
async function getMemberById(session, userID) {
  const result = await session.run(
    `MATCH (m:Member {userID: $userID}) 
     RETURN m`,
    { userID }
  );
  if (result.records.length === 0) {
    return null;
  }
  return result.records[0].get("m").properties;
}

// READ - Get all members
async function getAllMembers(session) {
  const result = await session.run(
    `MATCH (m:Member) 
     RETURN m`
  );
  return result.records.map(record => record.get("m").properties);
}

// UPDATE - Update member
async function updateMember(session, userID, updates) {
  let setClause = Object.keys(updates)
    .map(key => `m.${key} = $${key}`)
    .join(", ");

  const result = await session.run(
    `MATCH (m:Member {userID: $userID})
     SET ${setClause}
     RETURN m`,
    { userID, ...updates }
  );
  
  if (result.records.length === 0) {
    return null;
  }
  return result.records[0].get("m").properties;
}

// DELETE - Remove member
async function removeMember(session, userID) {
  const result = await session.run(
    `MATCH (m:Member {userID: $userID}) 
     DETACH DELETE m`,
    { userID }
  );
  return result.summary.counters.nodesDeleted > 0;
}

// Create friendship between two members
async function createFriendship(session, userID1, userID2) {
  const result = await session.run(
    `MATCH (m1:Member {userID: $userID1}), (m2:Member {userID: $userID2})
     MERGE (m1)-[r:IS_FRIENDS_WITH]->(m2)
     RETURN m1, m2, r`,
    { userID1, userID2 }
  );
  return result.records.length > 0;
}

// Get friends of friends (multi-hop, up to 2 hops away)
async function getFriendsOfFriends(session, userID) {
  const result = await session.run(
    `MATCH (m:Member {userID: $userID})-[:IS_FRIENDS_WITH*1..2]-(fof:Member)
     WHERE fof.userID <> $userID
     RETURN DISTINCT fof, 
            length(shortestPath((m)-[:IS_FRIENDS_WITH*]-(fof))) as distance
     ORDER BY distance`,
    { userID }
  );
  return result.records.map(record => ({
    member: record.get("fof").properties,
    distance: record.get("distance").toNumber()
  }));
}

// EVENT CRUD OPERATIONS

// CREATE - Add new event
async function addNewEvent(session, event) {
  if (!(event instanceof Event)) {
    throw new Error('Event must be an instance of Event class');
  }

  const result = await session.run(
    `CREATE (e:Event {
      id: $id,
      name: $name,
      location: $location,
      date: $date,
      description: $description
    }) RETURN e`,
    {
      id: event.id,
      name: event.name,
      location: JSON.stringify(event.location),
      date: event.date.toISOString(),
      description: event.description
    }
  );
  return result.records[0].get("e").properties;
}

// READ - Get event by ID
async function getEventById(session, eventId) {
  const result = await session.run(
    `MATCH (e:Event {id: $eventId}) 
     RETURN e`,
    { eventId }
  );
  if (result.records.length === 0) {
    return null;
  }
  return result.records[0].get("e").properties;
}

// READ - Get all events
async function getAllEvents(session) {
  const result = await session.run(
    `MATCH (e:Event) 
     RETURN e`
  );
  return result.records.map(record => record.get("e").properties);
}

// UPDATE - Update event
async function updateEvent(session, eventId, updates) {
  let setClause = Object.keys(updates)
    .map(key => `e.${key} = $${key}`)
    .join(", ");

  const result = await session.run(
    `MATCH (e:Event {id: $eventId})
     SET ${setClause}
     RETURN e`,
    { eventId, ...updates }
  );
  
  if (result.records.length === 0) {
    return null;
  }
  return result.records[0].get("e").properties;
}

// DELETE - Remove event
async function removeEvent(session, eventId) {
  const result = await session.run(
    `MATCH (e:Event {id: $eventId}) 
     DETACH DELETE e`,
    { eventId }
  );
  return result.summary.counters.nodesDeleted > 0;
}

// Record event attendance
async function attendEvent(session, userID, eventId) {
  const result = await session.run(
    `MATCH (m:Member {userID: $userID}), (e:Event {id: $eventId})
     MERGE (m)-[r:ATTENDED]->(e)
     RETURN m, e, r`,
    { userID, eventId }
  );
  return result.records.length > 0;
}

// Close the driver when the app exits
process.on("exit", async () => {
  await driver.close();
  console.log("Neo4j driver closed");
});

export {
  testConnection,
  // Member operations
  addNewMember,
  getMemberById,
  getAllMembers,
  updateMember,
  removeMember,
  // Friendship operations
  createFriendship,
  getFriendsOfFriends,
  // Event operations
  addNewEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  removeEvent,
  attendEvent,
  driver
};
