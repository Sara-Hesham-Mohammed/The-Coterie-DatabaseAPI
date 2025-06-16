import env from "dotenv";
import neo4j from "neo4j-driver";
import { User } from "../DataClasses/User.js";
import { Event } from "../DataClasses/Event.js";

env.config({
  path: "./config/.env",
});

// Replace with your Neo4j AuraDB credentials
const URI = process.env.AURA_DB_URI;
const USER = process.env.AURA_DB_USER;
const PASSWORD = process.env.AURA_DB_PASS;

// Create a Neo4j driver instance
export const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

// Session management function
export async function withSession(operation) {
  const session = driver.session();
  try {
    return await operation(session);
  } catch (error) {
    console.error("Database operation error:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Test connection using session management
async function testConnection() {
  return await withSession(async (session) => {
    const result = await session.run(
      'RETURN "Connected to Neo4j AuraDB!" AS message'
    );
    console.log(result.records[0].get("message"));
    return result.records[0].get("message");
  });
}

// CREATE - Add new user
async function addNewUser(user) {
  if (!(user instanceof User)) {
    throw new Error('User must be an instance of User class');
  }

  return await withSession(async (session) => {
    const result = await session.run(
      `CREATE (u:User {
        userID: $userID,
        name: $name,
        dateOfBirth: $dateOfBirth,
        gender: $gender,
        location: $location,
        phoneNumber: $phoneNumber,
        email: $email
      }) RETURN u`,
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
    console.log("New User added:", result.records[0].get("u").properties);
    return result.records[0].get("u").properties;
  });
}

// READ - Get user by ID
async function getUserById(userID) {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (u:User {userID: $userID}) 
       RETURN u`,
      { userID }
    );
    if (result.records.length === 0) {
      return null;
    }
    return result.records[0].get("u").properties;
  });
}

// READ - Get all users
async function getAllUsers() {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (u:User) 
       RETURN u`
    );
    return result.records.map(record => record.get("u").properties);
  });
}

// UPDATE - Update user
async function updateUser(userID, updates) {
  return await withSession(async (session) => {
    let setClause = Object.keys(updates)
      .map(key => `u.${key} = $${key}`)
      .join(", ");

    const result = await session.run(
      `MATCH (u:User {userID: $userID})
       SET ${setClause}
       RETURN u`,
      { userID, ...updates }
    );
    
    if (result.records.length === 0) {
      return null;
    }
    return result.records[0].get("u").properties;
  });
}

// DELETE - Remove user
async function removeUser(userID) {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (u:User {userID: $userID}) 
       DETACH DELETE u`,
      { userID }
    );
    return result.summary.counters.nodesDeleted > 0;
  });
}

// Create friendship between two users
async function createFriendship(userID1, userID2) {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (u1:User {userID: $userID1}), (u2:User {userID: $userID2})
       MERGE (u1)-[r:IS_FRIENDS_WITH]->(u2)
       RETURN u1, u2, r`,
      { userID1, userID2 }
    );
    return result.records.length > 0;
  });
}

// Get friends of friends (multi-hop, up to 2 hops away)
async function getFriendsOfFriends(userID) {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (u:User {userID: $userID})-[:IS_FRIENDS_WITH*1..2]-(fof:User)
       WHERE fof.userID <> $userID
       RETURN DISTINCT fof, 
              length(shortestPath((u)-[:IS_FRIENDS_WITH*]-(fof))) as distance
       ORDER BY distance`,
      { userID }
    );
    return result.records.map(record => ({
      user: record.get("fof").properties,
      distance: record.get("distance").toNumber()
    }));
  });
}

// EVENT CRUD OPERATIONS

// CREATE - Add new event
async function addNewEvent(event) {
  if (!(event instanceof Event)) {
    throw new Error('Event must be an instance of Event class');
  }

  return await withSession(async (session) => {
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
        date: event.date instanceof Date ? event.date.toISOString() : new Date().toISOString(),
        description: event.description || ''
      }
    );
    console.log("New Event added:", result.records[0].get("e").properties);
    return result.records[0].get("e").properties;
  });
}

// READ - Get event by ID
async function getEventById(eventId) {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (e:Event {id: $eventId}) 
       RETURN e`,
      { eventId }
    );
    if (result.records.length === 0) {
      return null;
    }
    const eventData = result.records[0].get("e").properties;
    console.log("Retrieved Event:", eventData);
    return eventData;
  });
}

// READ - Get all events
async function getAllEvents() {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (e:Event) 
       RETURN e`
    );
    const events = result.records.map(record => record.get("e").properties);
    console.log("Retrieved Events:", events);
    return events;
  });
}

// UPDATE - Update event
async function updateEvent(eventId, updates) {
  return await withSession(async (session) => {
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
      console.log("No event found to update with id:", eventId);
      return null;
    }
    const updatedEvent = result.records[0].get("e").properties;
    console.log("Updated Event:", updatedEvent);
    return updatedEvent;
  });
}

// DELETE - Remove event
async function removeEvent(eventId) {
  return await withSession(async (session) => {
    // First remove any relationships
    await session.run(
      `MATCH (e:Event {id: $eventId})<-[r]-()
       DELETE r`,
      { eventId }
    );

    // Then remove the event
    const result = await session.run(
      `MATCH (e:Event {id: $eventId}) 
       DELETE e`,
      { eventId }
    );
    
    const deleted = result.summary.counters.nodesDeleted > 0;
    console.log(`Event ${eventId} ${deleted ? 'deleted' : 'not found'}`);
    return deleted;
  });
}

// Attend event
async function attendEvent(userID, eventId) {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (u:User {userID: $userID}), (e:Event {id: $eventId})
       MERGE (u)-[r:ATTENDED]->(e)
       RETURN u, e, r`,
      { userID, eventId }
    );
    const attended = result.records.length > 0;
    console.log(`User ${userID} ${attended ? 'attended' : 'failed to attend'} event ${eventId}`);
    return attended;
  });
}

// Remove legacy Event nodes with old property names
async function removeLegacyEvents() {
  return await withSession(async (session) => {
    const result = await session.run(
      `MATCH (e:Event)
       WHERE e.eventID IS NOT NULL OR e.eventTitle IS NOT NULL OR e.endTime IS NOT NULL
       DETACH DELETE e`
    );
    console.log("Removed legacy Event nodes with old properties.");
    return result.summary.counters.nodesDeleted;
  });
}

// Bulk add users and events with relationships
async function bulkAddUsersAndEvents(users, events, relationships) {
  if (!Array.isArray(users) || !Array.isArray(events)) {
    throw new Error('Users and events must be arrays');
  }

  return await withSession(async (session) => {
    // Create all users first
    for (const user of users) {
      if (!(user instanceof User)) {
        throw new Error('Each user must be an instance of User class');
      }
      await session.run(
        `CREATE (u:User {
          userID: $userID,
          name: $name,
          dateOfBirth: $dateOfBirth,
          gender: $gender,
          location: $location,
          phoneNumber: $phoneNumber,
          email: $email
        })`,
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
    }

    // Create all events
    for (const event of events) {
      if (!(event instanceof Event)) {
        throw new Error('Each event must be an instance of Event class');
      }
      await session.run(
        `CREATE (e:Event {
          id: $id,
          name: $name,
          location: $location,
          date: $date,
          description: $description
        })`,
        {
          id: event.id,
          name: event.name,
          location: JSON.stringify(event.location),
          date: event.date instanceof Date ? event.date.toISOString() : new Date().toISOString(),
          description: event.description || ''
        }
      );
    }

    // Create relationships
    for (const rel of relationships) {
      if (rel.type === 'IS_FRIENDS_WITH') {
        await session.run(
          `MATCH (u1:User {userID: $userID1}), (u2:User {userID: $userID2})
           MERGE (u1)-[r:IS_FRIENDS_WITH]->(u2)`,
          { userID1: rel.from, userID2: rel.to }
        );
      } else if (rel.type === 'ATTENDED') {
        await session.run(
          `MATCH (u:User {userID: $userID}), (e:Event {id: $eventId})
           MERGE (u)-[r:ATTENDED]->(e)`,
          { userID: rel.from, eventId: rel.to }
        );
      }
    }

    return true;
  });
}

// Close the driver when the app exits
process.on("exit", async () => {
  await driver.close();
  console.log("Neo4j driver closed");
});

export {
  testConnection,
  addNewUser,
  getUserById,
  getAllUsers,
  updateUser,
  removeUser,
  createFriendship,
  getFriendsOfFriends,
  addNewEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  removeEvent,
  attendEvent,
  removeLegacyEvents,
  bulkAddUsersAndEvents
};
