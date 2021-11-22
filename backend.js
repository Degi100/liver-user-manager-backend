import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3022;
const mongoConnectString = process.env.MONGODB_URI;
mongoose.connect(mongoConnectString);

const uriIsAllowed = function (req, res, next) {
  const referer = req.headers.referer;
  const host = `http://${req.headers.host}`;
  let frontendUri = referer;
  if (frontendUri === undefined) {
    frontendUri = host;
  }
  if (
    frontendUri === undefined ||
    !frontendUri.startsWith(process.env.ALLOWED_FRONTEND_URI)
  ) {
    res.status(403).send("access from this uri is not allowed");
  } else {
    next();
  }
};

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
});
const UserModel = mongoose.model("User", userSchema, "users100");

app.use(express.json());
app.use(cors());
app.use(uriIsAllowed);

app.get("/", async (req, res) => {
  const users = await UserModel.find({}).select("name username email").sort({_id: -1});
  res.json(users);
});

app.delete("/deleteuser/:id", async (req, res) => {
  const id = req.params.id;
  const deleteResult = await UserModel.deleteOne({
    _id: new mongoose.Types.ObjectId(id),
  });
  res.json({
    result: deleteResult,
  });
});

app.post("/adduser", (req, res) => {
  const user = req.body.user;
  const user1 = new UserModel(user);
  user1.save((err) => {
    if (err) {
      res.status(500).send({ err });
    } else {
      res.json({
        userAdded: user1,
      });
    }
  });
});

app.patch("/edituser/:id", async (req, res) => {
  const id = req.params.id;
  const email = req.body.email;
  const updateResult = await UserModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { email } },
    { new: true }
  );
  res.json({
    result: updateResult,
  });
});

app.listen(port, () => {
  console.log(`listen on port ${port}`);
});
