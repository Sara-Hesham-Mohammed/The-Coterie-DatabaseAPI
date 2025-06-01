// publisher.js
import { createClient } from 'redis';

console.log("Starting Redis publisher...");


const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({ url: redisUrl });

// const redisClient = createClient({ host: 'redis', port: 6379 });

// Connect to Redis
try {
  await redisClient.connect();
  console.log("Connected to Redis successfully");
} catch (error) {
  console.log("Error connecting to Redis:", error);
}


console.log("Connected to Redis");

// Publish a message when a user is created
async function createUser(userData) {
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