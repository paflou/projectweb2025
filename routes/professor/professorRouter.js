var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");

// Route: GET /professor/
// Serve the main professor dashboard page
router.get("/", checkPermission('professor'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/professor.html"));
});

// Route: GET /professor/create
// Serve the page for creating a new thesis
router.get("/create", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/create_thesis.html"));
});

// Route: GET /professor/assign
// Serve the page for assigning a thesis
router.get("/assign", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/assign_thesis.html"));
});

// Route: GET /professor/view_thesis
// Serve the page for viewing theses
router.get("/view_thesis", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/view_thesis.html"));
});

// Route: GET /professor/invitations
// Serve the page for viewing invitations
router.get("/invitations", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/invitations.html"));
});

// Route: GET /professor/stats
// Serve the statistics page for professors
router.get("/stats", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/statistics.html"));
});

// Route: GET /professor/manage
// Serve the page for managing professor-related data
router.get("/manage", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/manage.html"));
});

// Export the router to be used in the main app
module.exports = router; 
