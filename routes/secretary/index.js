var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");

router.get("/", checkPermission('secretary'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/secretary.html"));
});

router.get("/view_thesis", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/view_thesis.html"));
});

router.get("/input", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/input.html"));
});

router.get("/manage", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/manage.html"));
});

module.exports = router;
