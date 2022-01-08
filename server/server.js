const express = require("express");
const app = express();
const path = require("path");
const router = require("./router");
const Parse = require("../server/modules/parse");
let server = require("http").Server(app);
app.use("/api", router);
app.use("/", express.static(path.join(__dirname, "../dist/spa")));
server.listen(3005, async () => {
  const parse = new Parse();
  // parse.parse();
  console.log("We are live on " + 3005);
});
