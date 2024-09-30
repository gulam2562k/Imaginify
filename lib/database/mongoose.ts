import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Declare a global variable to store the cached connection
declare global {
    var mongoose: MongooseConnection | undefined;
}

let cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: 'imaginify',
            bufferCommands: false,
        }).then((mongoose) => {
            return mongoose;
        }).catch((error) => {
            cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.conn = null;
        throw error;
    }

    return cached.conn;
};
