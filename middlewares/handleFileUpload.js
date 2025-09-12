const formidable = require('formidable');
const fs = require('fs');
const path = require('path');


const {
  saveFileNameToDB
} = require("../services/student/index");
// Combine these 2 functions at some point

// Function to handle thesis file upload
async function handleThesisUpload(req, userId) {
  const uploadDir = path.join(process.cwd(), 'uploads/theses');

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024 // 50MB
  });
  // Validate file type
  const allowedTypes = [
    'application/pdf',                                                          // PDF files
    'application/vnd.oasis.opendocument.text',                                  // ODT (OpenDocument Text)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   // DOCX (modern Word)
  ];

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return resolve({ success: false, error: 'File upload error' });

      try {
        const file = Array.isArray(files.thesis) ? files.thesis[0] : files.thesis;
        if (!file) return resolve({ success: false, error: 'No file uploaded' });

        if (!allowedTypes.includes(file.mimetype)) {
          return resolve({ success: false, error: 'Invalid file type. Only PDF, ODT, and DOCX are allowed.' });
        }

        // Generate unique filename
        const originalName = path.basename(file.originalFilename);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${originalName}`;
        const newPath = path.join(uploadDir, uniqueName);

        // Move file
        await fs.promises.copyFile(file.filepath, newPath);
        await fs.promises.unlink(file.filepath);

        // Save filename to DB
        await saveFileNameToDB(userId, uniqueName);

        resolve({ success: true, filename: uniqueName });
      } catch (error) {
        console.error('Upload error:', error);
        resolve({ success: false, error: 'Server error during file processing' });
      }
    });
  });
}
async function handleFileUpload(req) {
  const fsPromises = fs.promises;
  const uploadDir = path.join(process.cwd(), 'uploads/theses_descriptions');

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.allowEmptyFiles = true; // allow empty file uploads
  form.minFileSize = 0;

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);

      let safeName = 'NULL';
      const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

      if (file && file.size > 0) {
        try {
          const oldPath = file.filepath;

          safeName = path.basename(file.originalFilename);
          const newPath = path.join(uploadDir, safeName);

          await fsPromises.copyFile(oldPath, newPath);
          await fsPromises.unlink(oldPath); // cleanup temp file
        } catch (error) {
          return reject(error);
        }
      }

      resolve({ fields, safeName });
    });
  });
}


module.exports = {
  handleThesisUpload,
  handleFileUpload
}
