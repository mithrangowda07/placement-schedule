import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'rvce-placement';

if (!MONGODB_URI && typeof window === 'undefined') {
  console.warn('[MongoDB Warning]: MONGODB_URI is not defined in environment variables.');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let clientPromise: Promise<MongoClient> | undefined;

if (MONGODB_URI) {
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = globalThis as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
}

/**
 * Connect to MongoDB database. Reuses existing client connection if cached.
 */
export async function connectToDatabase(): Promise<MongoConnection> {
  if (!MONGODB_URI || !clientPromise) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return { client, db };
}
