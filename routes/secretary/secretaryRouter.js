var express = require("express");
var router = express.Router();
var path = require("path"); // Add this line to import the path module
const checkPermission = require("../../middlewares/checkPermission");

router.get("/",checkPermission('secretary'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/secretary.html"));
});


module.exports = router;
