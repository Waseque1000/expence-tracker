import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined. Add it to your .env.local");
}

type GlobalMongoose = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { mongoose?: GlobalMongoose };

const cached: GlobalMongoose = globalForMongoose.mongoose ?? { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = MONGODB_URI as string;
    cached.promise = mongoose.connect(uri).then((m) => m);
  }
  cached.conn = await cached.promise;
  globalForMongoose.mongoose = cached;
  return cached.conn;
}
