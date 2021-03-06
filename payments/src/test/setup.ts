import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?:string): string[];
    }
  }
}

jest.mock("../nats-wrapper.ts");

let mongo: any;
process.env.STRIPE_KEY='sk_test_NvkWafY01XEtcx0AVHCp3dMS00jOqHAmyX'
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  mongo.stop();
  mongoose.connection.close();
});

global.signin =  (id?:string) => {
  // Build a JWT payload { id, email}
  const payload = {id: id || new mongoose.Types.ObjectId().toHexString(), email: "test@test.com" };
  //Create the JWT

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // BUild a session object {jwt: MY_JWT}
  const session = { jwt: token };
  //Turn that session into json
  const sessionJSON = JSON.stringify(session);
  // Take json and encode in base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string that is cookie with encoded data
  return [`express:sess=${base64}`];
};
