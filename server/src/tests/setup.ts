import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  // Clean up
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})
