// streams-publisher.js
import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });
await redisClient.connect();

// Add user event to a stream (persistent)
await redisClient.xAdd(
  'user_events', // Stream name
  '*', // Auto-generate message ID
  { // Key-value pairs
    userId: '123',
    action: 'created',
    name: 'Alice'
  }
);
console.log('Added event to Redis Stream');