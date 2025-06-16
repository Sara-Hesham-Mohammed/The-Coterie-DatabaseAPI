import { User } from '../DataClasses/User.js';
import { Event } from '../DataClasses/Event.js';
import {
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
  withSession,
  removeLegacyEvents
} from '../config/db.js';

// Cleanup function to remove all old data
async function cleanupOldData() {
  console.log("\nCleaning up old data...");
  try {
    // Remove legacy event nodes first
    const legacyDeleted = await removeLegacyEvents();
    if (legacyDeleted > 0) {
      console.log(`   Removed ${legacyDeleted} legacy Event nodes.`);
    }
    await withSession(async (session) => {
      // Delete all relationships first
      console.log("   Deleting all relationships...");
      await session.run('MATCH ()-[r]->() DELETE r');
      
      // Delete all nodes
      console.log("   Deleting all nodes...");
      await session.run('MATCH (n) DELETE n');
      
      console.log("   ✓ Old data cleaned up successfully");
    });
  } catch (error) {
    console.error("   Error cleaning up old data:", error);
    throw error;
  }
}

// Test data
const testUser1 = new User(
  1,
  "John Doe",
  new Date("1990-01-01"),
  "male",
  { city: "New York", country: "USA" },
  "+1234567890",
  "john@example.com",
  new Set(), // Empty set for tags
  new Set()  // Empty set for attended events
);

const testUser2 = new User(
  2,
  "Jane Smith",
  new Date("1992-05-15"),
  "female",
  { city: "Los Angeles", country: "USA" },
  "+1987654321",
  "jane@example.com",
  new Set(), // Empty set for tags
  new Set()  // Empty set for attended events
);

const testEvent = new Event(
  1,
  "Tech Conference 2024",
  { city: "San Francisco", venue: "Convention Center" },
  new Date("2024-06-15"),
  "Annual technology conference featuring the latest innovations"
);

async function runTests() {
  try {
    console.log("Starting database tests...\n");

    // Clean up old data first
    await cleanupOldData();

    // Test connection
    console.log("1. Testing connection...");
    await testConnection();
    console.log("✓ Connection successful\n");

    // User CRUD Tests
    console.log("2. Testing User CRUD operations...");
    
    // Create
    console.log("   Creating test users...");
    const createdUser1 = await addNewUser(testUser1);
    const createdUser2 = await addNewUser(testUser2);
    console.log("   ✓ Users created successfully");

    // Read
    console.log("   Testing getUserById...");
    const retrievedUser = await getUserById(1);
    console.log("   ✓ User retrieved successfully");

    console.log("   Testing getAllUsers...");
    const allUsers = await getAllUsers();
    console.log("   ✓ All users retrieved successfully");

    // Update
    console.log("   Testing updateUser...");
    const updatedUser = await updateUser(1, { name: "John Updated" });
    console.log("   ✓ User updated successfully");

    // Create friendship
    console.log("   Testing createFriendship...");
    const friendshipCreated = await createFriendship(1, 2);
    console.log("   ✓ Friendship created successfully");

    // Get friends of friends
    console.log("   Testing getFriendsOfFriends...");
    const friendsOfFriends = await getFriendsOfFriends(1);
    console.log("   ✓ Friends of friends retrieved successfully");

    // Event CRUD Tests
    console.log("\n3. Testing Event CRUD operations...");
    
    // Create
    console.log("   Creating test event...");
    const createdEvent = await addNewEvent(testEvent);
    console.log("   ✓ Event created successfully");

    // Read
    console.log("   Testing getEventById...");
    const retrievedEvent = await getEventById(1);
    console.log("   ✓ Event retrieved successfully");

    console.log("   Testing getAllEvents...");
    const allEvents = await getAllEvents();
    console.log("   ✓ All events retrieved successfully");

    // Update
    console.log("   Testing updateEvent...");
    const updatedEvent = await updateEvent(1, { name: "Updated Tech Conference" });
    console.log("   ✓ Event updated successfully");

    // Attend event
    console.log("   Testing attendEvent...");
    const eventAttended = await attendEvent(1, 1);
    console.log("   ✓ Event attendance recorded successfully");

    // Cleanup
    console.log("\n4. Cleaning up test data...");
    try {
      // First remove relationships
      console.log("   Removing relationships...");
      await withSession(async (session) => {
        await session.run('MATCH ()-[r:ATTENDED]->() DELETE r');
        await session.run('MATCH ()-[r:IS_FRIENDS_WITH]->() DELETE r');
      });
      console.log("   ✓ Relationships removed successfully");

      // Then remove events
      console.log("   Removing events...");
      await removeEvent(1);
      console.log("   ✓ Events removed successfully");

      // Finally remove users
      console.log("   Removing users...");
      await removeUser(2);
      await removeUser(1);
      console.log("   ✓ Users removed successfully");
    } catch (error) {
      console.error("   Error during cleanup:", error);
      throw error;
    }

    console.log("\nAll tests completed successfully! ✓");

  } catch (error) {
    console.error("\nTest failed:", error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 