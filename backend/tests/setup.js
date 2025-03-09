process.noDeprecation = true;

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Set the MONGO_URL env variable so that connectDB() gets a valid URI.
  process.env.MONGO_URL = mongoUri;
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
