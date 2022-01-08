const express = require("express");
const app = express();
const path = require("path");
const router = require("./router");
let server = require("http").Server(app);
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/api", router);
app.use("/", express.static(path.join(__dirname, "../dist/spa")));
server.listen(3005, async () => {
  console.log("We are live on " + 3005);
});
