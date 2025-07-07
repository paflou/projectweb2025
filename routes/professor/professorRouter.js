var express = require("express");
var router = express.Router();
var path = require("path"); // Add this line to import the path module
const checkPermission = require("../../middlewares/checkPermission");

router.get("/",checkPermission('professor'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/professor.html"));
});

router.get("/create", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/create_thesis.html"));
});

router.get("/assign", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/assign_thesis.html"));
});

router.get("/view_thesis", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/view_thesis.html"));
});

router.get("/invitations", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/invitations.html"));
});

router.get("/stats", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/statistics.html"));
});

router.get("/manage", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/manage.html"));
});

module.exports = router;
