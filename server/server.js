const express = require("express");
const app = express();
const path = require("path");
const router = require("./router");
let server = require("http").Server(app);
app.use("/api", router);
app.use("/", express.static(path.join(__dirname, "../dist/spa")));
server.listen(3001, async () => {
  console.log("We are live on " + 3001);
});
