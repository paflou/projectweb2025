const { insertThesisToDB, updateThesis } = require("../services/professor/index");
const handleFileUpload = require("../middlewares/handleFileUpload").handleFileUpload;

// Handles thesis submission, including file upload and database insertion
async function submitThesis(req, res, action) {
  try {
    const { fields, safeName } = await handleFileUpload(req);
    if (action === 'insert')
      insertThesisToDB(req, res, fields, safeName);
    else if (action === 'update')
      updateThesis(req, res, fields, safeName);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving the file');
  }
}

module.exports = {
  submitThesis,
};