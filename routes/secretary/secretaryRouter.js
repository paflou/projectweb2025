// Import required modules
var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");

// Route: GET /secretary/
// Serve the main secretary page
router.get("/", checkPermission('secretary'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/secretary.html"));
});

// Route: GET /secretary/view_thesis
// Serve the page for viewing theses
router.get("/view_thesis", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/view_thesis.html"));
});

// Route: GET /secretary/input
// Serve the page for inputting data
router.get("/input", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/input.html"));
});

// Route: GET /secretary/manage
// Serve the page for managing data
router.get("/manage", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/manage.html"));
});

// Export the router to be used in the main app
module.exports = router;
