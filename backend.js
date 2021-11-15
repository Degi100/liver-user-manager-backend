import express from "express";
import mongodb, { MongoClient } from "mongodb";


const app = express();
const port = 3022;
const mongoConnectionString = "mongodb://localhost:27017";
const client = new MongoClient(mongoConnectionString);

const execMongo = async (done) => {
  await client.connect();
  const db = client.db("api001");
  done(db);
};

app.get("/", (req, res) => {
  execMongo(async (db) => {
    const users = await db.collection("users100").find()
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
		const deleteResault = await db.collection("users100").deleteOne({_id: new mongodb.ObjectId(id)})
		res.json({
			result: deleteResault
		})
	});
})

app.listen(port, () => {
  console.log(`listingen on port ${port}`);
});
