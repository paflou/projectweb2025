var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
const formidable = require('formidable');
const fs = require('fs');
const { importJsonData } = require("../../services/secretary/importService");
const {
  getActiveAndUnderReviewTheses,
  getThesisDetails,
  recordApNumber,
  cancelThesisAssignment,
  markThesisCompleted
} = require("../../services/secretary/secretaryService");

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

// Route to handle JSON file upload and import at /secretary/input
router.post("/input", checkPermission("secretary"), async (req, res) => {
  const uploadDir = path.join(process.cwd(), 'uploads/imports');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    multiples: false,        // single file
    uploadDir: uploadDir,
    maxFileSize: 10 * 1024 * 1024 // 10 MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }

    console.log('Form fields:', fields);
    console.log('Uploaded files:', files);

    let file = files.jsonFile;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = file.path || file.filepath; // Formidable v2 uses `path`
    if (!filePath) {
      return res.status(500).json({ success: false, message: 'Uploaded file path missing' });
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      const importResult = await importJsonData(jsonData);

      res.json(importResult);
    } catch (readErr) {
      console.error('File read/parse error:', readErr);
      res.status(400).json({ success: false, message: 'Invalid JSON file' });
    }
  });
});


router.get("/manage", checkPermission("secretary"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/secretary/manage.html"));
});

// API Routes for thesis data

// Custom authentication middleware for API routes that returns JSON instead of redirect
function checkSecretaryApiPermission(req, res, next) {
  if (req.session.userId === null || req.session.userId === undefined) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.role !== 'secretary') {
    return res.status(403).json({ error: 'Secretary access required' });
  }
  next();
}

// Get all active and under-review theses
router.get("/api/theses", checkSecretaryApiPermission, async (req, res) => {
  try {
    const theses = await getActiveAndUnderReviewTheses();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ theses }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /api/theses:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get detailed information for a specific thesis
router.get("/api/thesis/:id", checkSecretaryApiPermission, async (req, res) => {
  try {
    const thesisId = parseInt(req.params.id);
    if (isNaN(thesisId)) {
      return res.status(400).json({ error: 'Invalid thesis ID' });
    }

    const thesis = await getThesisDetails(thesisId);
    if (!thesis) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ thesis }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /api/thesis/:id:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Record AP number for active thesis
router.post("/api/thesis/:id/record-ap", checkSecretaryApiPermission, async (req, res) => {
  try {
    const thesisId = parseInt(req.params.id);
    const { apNumber, apYear } = req.body;

    if (isNaN(thesisId)) {
      return res.status(400).json({ error: 'Invalid thesis ID' });
    }

    if (!apNumber || !apYear) {
      return res.status(400).json({ error: 'AP number and year are required' });
    }

    const result = await recordApNumber(thesisId, apNumber, parseInt(apYear));

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /api/thesis/:id/record-ap:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Cancel thesis assignment
router.post("/api/thesis/:id/cancel", checkSecretaryApiPermission, async (req, res) => {
  try {
    const thesisId = parseInt(req.params.id);
    const { cancellationApNumber, cancellationApYear, cancellationReason } = req.body;

    if (isNaN(thesisId)) {
      return res.status(400).json({ error: 'Invalid thesis ID' });
    }

    if (!cancellationApNumber || !cancellationApYear || !cancellationReason) {
      return res.status(400).json({ error: 'Cancellation AP number, year, and reason are required' });
    }

    const result = await cancelThesisAssignment(
      thesisId,
      cancellationApNumber,
      parseInt(cancellationApYear),
      cancellationReason
    );

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /api/thesis/:id/cancel:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Mark thesis as completed
router.post("/api/thesis/:id/complete", checkSecretaryApiPermission, async (req, res) => {
  try {
    const thesisId = parseInt(req.params.id);

    if (isNaN(thesisId)) {
      return res.status(400).json({ error: 'Invalid thesis ID' });
    }

    const result = await markThesisCompleted(thesisId);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /api/thesis/:id/complete:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
