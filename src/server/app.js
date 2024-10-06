const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const { createTripData} = require("./controllers/tripControllers");

const app = express();

app.use(express.static("dist"));

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).sendFile("/dist/index.html", {
    root: __dirname + "/../..",
  });
});

app.post("/addtrip", createTripData);



module.exports = app;
