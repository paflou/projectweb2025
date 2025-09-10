var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
const {
  getThesisInfo,
} = require("../../services/studentService");

const thesisRoutes = require("./thesisRoutes");
const invitationRoutes = require("./invitationRoutes");
const profileRoutes = require("./profileRoutes");

router.use(profileRoutes);
router.use(invitationRoutes);
router.use(thesisRoutes);

// Route: GET /student
// Serve the main student page
router.get("/", checkPermission('student'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/student.html"));
});

// Route: GET /student/view_thesis
// Serve the page for viewing theses
router.get("/view_thesis", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/view_thesis.html"));
});

// Route: GET /student/profile
// Serve the student profile page
router.get("/profile", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/profile.html"));
});

// Route: GET /student/manage
// Serve the student manage page
router.get("/manage", checkPermission("student"), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    res.locals.thesisInfo = thesisInfo;
    res.sendFile(path.join(__dirname, "../../public/student/manage.html"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
