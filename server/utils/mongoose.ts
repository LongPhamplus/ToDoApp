// server/utils/mongoose.ts
import mongoose, { Connection } from 'mongoose'

let connection: Connection | null = null

export async function connectDB(): Promise<Connection> {
  if (connection) {
    return connection
  }

  const config = useRuntimeConfig()
  const mongodbUri = config.mongodbUri

  if (!mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  try {
    const mongoose_instance = await mongoose.connect(mongodbUri, {
      bufferCommands: false,
    })

    connection = mongoose_instance.connection
    console.log('✅ MongoDB connected successfully')
    return connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export function getConnection(): Connection | null {
  return connection
}

export async function disconnectDB(): Promise<void> {
  if (connection) {
    await mongoose.disconnect()
    connection = null
    console.log('✅ MongoDB disconnected')
  }
}
