const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function generateReport(options = {}) {
    const {
        outputPath = 'output.pdf',
        fields = {} // key-value pairs of form fields
    } = options;

    try {
        const inputPath = path.join(__dirname, 'praktiko_template.pdf');

        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        // Load the input PDF
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the form inside the PDF
        const form = pdfDoc.getForm();

        // Fill each field with provided value
        Object.entries(fields).forEach(([fieldName, value]) => {
            const field = form.getTextField(fieldName);
            if (!field) {
                console.warn(`Field "${fieldName}" not found in the PDF`);
            } else {
                field.setText(value);
            }
        });

        // Flatten the form so fields become permanent
        form.flatten();

        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();
        const resolvedOutputPath = path.resolve(outputPath);

        fs.writeFileSync(resolvedOutputPath, pdfBytes);
        return resolvedOutputPath;
    } catch (err) {
        console.error('Error generating annotated PDF:', err.message);
        throw err;
    }
}

module.exports = generateReport;
