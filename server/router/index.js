const express = require("express");
const router = express.Router();
const Parse = require("../modules/parse");
const { parse } = new Parse();

router.get("/parse", parse);
module.exports = router;
