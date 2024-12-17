var express = require("express");
var router = express.Router();
var path = require("path"); // Add this line to import the path module

/* GET login page. */
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;
