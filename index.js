const express = require("express");
const app = express();
const port = 3000;
const Router = require("./routes/router");
const mongoose = require("./config/mongoose");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static(path.join(__dirname, "public")));

app.use("/", Router);
app.listen(port, (err) => {
  if (!err) {
    console.log(`server running on port: ${port}`);
  } else {
    console.log(`${err}`);
  }
});
