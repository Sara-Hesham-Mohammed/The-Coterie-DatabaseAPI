// publisher.js
import { createClient } from 'redis';

console.log("Starting Redis publisher...");


const redisClient = createClient({ url: 'redis://localhost:6379' });

// Connect to Redis
await redisClient.connect();

console.log("Connected to Redis");

// Publish a message when a user is created
async function createUser(userData) {
  // 1. Save user to DB (e.g., PostgreSQL/MongoDB)
  // await db.saveUser(userData);

  await test();

  // 2. Publish event to Redis channel
  await redisClient.publish(
    'user_created', 
    JSON.stringify(userData)
  );
  console.log(`Published user_created event: ${userData.id}`);
}

function test() {
  console.log("Test function user creation executed");
}

// Example usage
createUser({ id: 123, name: 'Alice', email: 'alice@example.com' });