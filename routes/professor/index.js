var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
const thesisRoutes = require("./thesisRoutes");
const invitationRoutes = require("./invitationRoutes");
const assignmentRoutes = require("./assignmentRoutes");
const gradingRoutes = require("./gradingRoutes");
const notesRoutes = require("./notesRoutes");
const presentationRoutes = require("./presentationRoutes");

router.use('/api', thesisRoutes);
router.use('/api', invitationRoutes);
router.use('/api', assignmentRoutes);
router.use('/api', gradingRoutes);
router.use('/api', notesRoutes);
router.use('/api', presentationRoutes);

// Route: /prof/

router.get("/", checkPermission('professor'), (req, res) => {
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

router.get(['/manage/:id'], checkPermission('professor'), (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/professor/manage.html'));
});

module.exports = router;

