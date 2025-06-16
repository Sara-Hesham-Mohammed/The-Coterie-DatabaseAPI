import { User } from '../DataClasses/User.js';
import { Event } from '../DataClasses/Event.js';
import {
  bulkAddUsersAndEvents,
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

async function runBulkAddTest() {
  try {
    console.log("Starting bulk add test...\n");

    // Clean up old data first
    await cleanupOldData();

    // Create test users (10 users)
    const users = [
      new User(
        1,
        "John Doe",
        new Date("1990-01-01"),
        "male",
        { city: "New York", country: "USA" },
        "+1234567890",
        "john@example.com",
        new Set(),
        new Set()
      ),
      new User(
        2,
        "Jane Smith",
        new Date("1992-05-15"),
        "female",
        { city: "Los Angeles", country: "USA" },
        "+1987654321",
        "jane@example.com",
        new Set(),
        new Set()
      ),
      new User(
        3,
        "Bob Wilson",
        new Date("1988-11-30"),
        "male",
        { city: "Chicago", country: "USA" },
        "+1122334455",
        "bob@example.com",
        new Set(),
        new Set()
      ),
      new User(
        4,
        "Alice Johnson",
        new Date("1995-03-22"),
        "female",
        { city: "Seattle", country: "USA" },
        "+1555666777",
        "alice@example.com",
        new Set(),
        new Set()
      ),
      new User(
        5,
        "Michael Brown",
        new Date("1985-07-10"),
        "male",
        { city: "Boston", country: "USA" },
        "+1444333222",
        "michael@example.com",
        new Set(),
        new Set()
      ),
      new User(
        6,
        "Emily Davis",
        new Date("1993-09-18"),
        "female",
        { city: "Austin", country: "USA" },
        "+1777888999",
        "emily@example.com",
        new Set(),
        new Set()
      ),
      new User(
        7,
        "David Lee",
        new Date("1991-12-05"),
        "male",
        { city: "San Francisco", country: "USA" },
        "+1666555444",
        "david@example.com",
        new Set(),
        new Set()
      ),
      new User(
        8,
        "Sarah Miller",
        new Date("1994-04-30"),
        "female",
        { city: "Denver", country: "USA" },
        "+1888999000",
        "sarah@example.com",
        new Set(),
        new Set()
      ),
      new User(
        9,
        "James Wilson",
        new Date("1987-08-15"),
        "male",
        { city: "Miami", country: "USA" },
        "+1222111333",
        "james@example.com",
        new Set(),
        new Set()
      ),
      new User(
        10,
        "Olivia Taylor",
        new Date("1996-02-28"),
        "female",
        { city: "Portland", country: "USA" },
        "+1999888777",
        "olivia@example.com",
        new Set(),
        new Set()
      )
    ];

    // Create test events (10 events)
    const events = [
      new Event(
        1,
        "Tech Conference 2024",
        { city: "San Francisco", venue: "Convention Center" },
        new Date("2024-06-15"),
        "Annual technology conference featuring the latest innovations"
      ),
      new Event(
        2,
        "Music Festival",
        { city: "Austin", venue: "Zilker Park" },
        new Date("2024-07-20"),
        "Summer music festival with top artists"
      ),
      new Event(
        3,
        "Startup Summit",
        { city: "New York", venue: "Marriott Marquis" },
        new Date("2024-05-10"),
        "Networking event for startup founders and investors"
      ),
      new Event(
        4,
        "Art Exhibition",
        { city: "Los Angeles", venue: "LACMA" },
        new Date("2024-08-15"),
        "Contemporary art exhibition featuring emerging artists"
      ),
      new Event(
        5,
        "Food Fair",
        { city: "Chicago", venue: "Grant Park" },
        new Date("2024-09-05"),
        "International food festival with culinary delights"
      ),
      new Event(
        6,
        "Marathon",
        { city: "Boston", venue: "Downtown" },
        new Date("2024-04-21"),
        "Annual city marathon with thousands of participants"
      ),
      new Event(
        7,
        "Film Festival",
        { city: "Seattle", venue: "SIFF Cinema" },
        new Date("2024-10-12"),
        "Independent film festival showcasing new directors"
      ),
      new Event(
        8,
        "Book Fair",
        { city: "Denver", venue: "Convention Center" },
        new Date("2024-11-03"),
        "Annual book fair with author signings and readings"
      ),
      new Event(
        9,
        "Tech Workshop",
        { city: "Miami", venue: "Wynwood Labs" },
        new Date("2024-03-18"),
        "Hands-on workshop for developers and engineers"
      ),
      new Event(
        10,
        "Charity Gala",
        { city: "Portland", venue: "Hilton Hotel" },
        new Date("2024-12-10"),
        "Annual charity event to support local communities"
      )
    ];

    // Define relationships
    const relationships = [
      // Friendships (more connections between all 10 users)
      { type: 'IS_FRIENDS_WITH', from: 1, to: 2 },  // John is friends with Jane
      { type: 'IS_FRIENDS_WITH', from: 2, to: 3 },  // Jane is friends with Bob
      { type: 'IS_FRIENDS_WITH', from: 1, to: 3 },  // John is friends with Bob
      { type: 'IS_FRIENDS_WITH', from: 4, to: 5 },  // Alice is friends with Michael
      { type: 'IS_FRIENDS_WITH', from: 6, to: 7 },  // Emily is friends with David
      { type: 'IS_FRIENDS_WITH', from: 8, to: 9 },  // Sarah is friends with James
      { type: 'IS_FRIENDS_WITH', from: 10, to: 1 }, // Olivia is friends with John
      { type: 'IS_FRIENDS_WITH', from: 2, to: 4 },  // Jane is friends with Alice
      { type: 'IS_FRIENDS_WITH', from: 3, to: 6 },  // Bob is friends with Emily
      { type: 'IS_FRIENDS_WITH', from: 5, to: 8 },  // Michael is friends with Sarah
      { type: 'IS_FRIENDS_WITH', from: 7, to: 10 }, // David is friends with Olivia
      { type: 'IS_FRIENDS_WITH', from: 9, to: 2 },  // James is friends with Jane
      { type: 'IS_FRIENDS_WITH', from: 4, to: 7 },  // Alice is friends with David
      { type: 'IS_FRIENDS_WITH', from: 6, to: 9 },  // Emily is friends with James
      
      // Event attendance (each user attends 2-3 events)
      { type: 'ATTENDED', from: 1, to: 1 },  // John attended Tech Conference
      { type: 'ATTENDED', from: 2, to: 1 },  // Jane attended Tech Conference
      { type: 'ATTENDED', from: 3, to: 2 },   // Bob attended Music Festival
      { type: 'ATTENDED', from: 4, to: 3 },   // Alice attended Startup Summit
      { type: 'ATTENDED', from: 5, to: 4 },   // Michael attended Art Exhibition
      { type: 'ATTENDED', from: 6, to: 5 },   // Emily attended Food Fair
      { type: 'ATTENDED', from: 7, to: 6 },   // David attended Marathon
      { type: 'ATTENDED', from: 8, to: 7 },   // Sarah attended Film Festival
      { type: 'ATTENDED', from: 9, to: 8 },   // James attended Book Fair
      { type: 'ATTENDED', from: 10, to: 9 },  // Olivia attended Tech Workshop
      { type: 'ATTENDED', from: 1, to: 10 },  // John attended Charity Gala
      { type: 'ATTENDED', from: 2, to: 3 },   // Jane attended Startup Summit
      { type: 'ATTENDED', from: 3, to: 5 },   // Bob attended Food Fair
      { type: 'ATTENDED', from: 4, to: 7 },   // Alice attended Film Festival
      { type: 'ATTENDED', from: 5, to: 9 },   // Michael attended Tech Workshop
      { type: 'ATTENDED', from: 6, to: 2 },   // Emily attended Music Festival
      { type: 'ATTENDED', from: 7, to: 4 },   // David attended Art Exhibition
      { type: 'ATTENDED', from: 8, to: 6 },   // Sarah attended Marathon
      { type: 'ATTENDED', from: 9, to: 1 },   // James attended Tech Conference
      { type: 'ATTENDED', from: 10, to: 8 }   // Olivia attended Book Fair
    ];

    // Run the bulk add operation
    console.log("Adding users, events, and relationships...");
    const result = await bulkAddUsersAndEvents(users, events, relationships);
    console.log("✓ Bulk add completed successfully!");

    // Verify the data was added correctly
    await withSession(async (session) => {
      // Check users
      const userCount = await session.run('MATCH (u:User) RETURN count(u) as count');
      console.log(`\nCreated ${userCount.records[0].get('count').toNumber()} users`);

      // Check events
      const eventCount = await session.run('MATCH (e:Event) RETURN count(e) as count');
      console.log(`Created ${eventCount.records[0].get('count').toNumber()} events`);

      // Check friendships
      const friendshipCount = await session.run('MATCH ()-[r:IS_FRIENDS_WITH]->() RETURN count(r) as count');
      console.log(`Created ${friendshipCount.records[0].get('count').toNumber()} friendships`);

      // Check event attendance
      const attendanceCount = await session.run('MATCH ()-[r:ATTENDED]->() RETURN count(r) as count');
      console.log(`Created ${attendanceCount.records[0].get('count').toNumber()} event attendances`);

      // Show some sample data
      console.log("\nSample data:");
      const sampleData = await session.run(`
        MATCH (u:User)-[r]->(e:Event)
        RETURN u.name as userName, type(r) as relationship, e.name as eventName
        LIMIT 5
      `);
      
      sampleData.records.forEach(record => {
        console.log(`${record.get('userName')} ${record.get('relationship')} ${record.get('eventName')}`);
      });
    });

    console.log("\nTest completed successfully! ✓");

  } catch (error) {
    console.error("\nTest failed:", error);
    process.exit(1);
  }
}

// Run the test
runBulkAddTest();