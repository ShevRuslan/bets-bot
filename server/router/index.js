const express = require("express");
const router = express.Router();
const Parse = require("../modules/parse");
const { startParse, stopParse, getLastTimeUpdate } = new Parse();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "server/public");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
const cpUpload = upload.fields([
  { name: "fileBot", maxCount: 1 },
  { name: "fileProxy", maxCount: 1 },
]);
router.post("/startParse", cpUpload, startParse);
router.post("/stopParse", stopParse);
router.get("/getLastTimeUpdate", getLastTimeUpdate);
module.exports = router;
