const mongoose = require("mongoose");

const uri =
  "mongodb+srv://ashushreyansh:zAgOaE1yR0iYLDiL@employeereviewsystem.wpuyz3o.mongodb.net/ERS";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(uri, options);

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB Cloud");
});

db.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

module.exports = mongoose;
