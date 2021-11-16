import express from "express";
import mongodb, { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3022;
const mongoConnectionString = process.env.MONGODB_URI;
const client = new MongoClient(mongoConnectionString);

app.use(express.json());
app.use(cors());

const execMongo = async (done) => {
  await client.connect();
  const db = client.db("api001");
  done(db);
};

app.get("/", (req, res) => {
  execMongo(async (db) => {
    const users = await db
      .collection("users100")
      .find()
      .project({
        name: 1,
        username: 1,
        email: 1,
      })
      .toArray();
    res.json(users);
  });
});

app.delete("/deleteuser/:id", (req, res) => {
  const id = req.params.id;
  execMongo(async (db) => {
    const deleteResult = await db
      .collection("users100")
      .deleteOne({ _id: new mongodb.ObjectId(id) });
    res.json({
      result: deleteResult,
    });
  });
});

app.post("/adduser", (req, res) => {
  const user = req.body.user;
  execMongo(async (db) => {
    const insertResult = await db.collection("user100").insertOne(user);
    res.json({
      result: insertResult,
    });
  });
});

app.patch("/edituser/:id", (req, res) => {
  const id = req.params.id;
  const email = req.body.email;
  console.log(email);
  execMongo(async (db) => {
    const updateResult = await db
      .collection("users100")
      .updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { email } });
    res.json({
      result: updateResult,
    });
  });
});

app.listen(port, () => {
  console.log(`listingen on port ${port}`);
});
