
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const importBtn = document.getElementById('importBtn');
const importForm = document.getElementById('importForm');
const resultsSection = document.getElementById('resultsSection');
const loadingSpinner = document.querySelector('.loading-spinner');

// Drag and drop functionality
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

function handleFileSelection(file) {
    if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Παρακαλώ επιλέξτε ένα JSON αρχείο.');
        return;
    }

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
    importBtn.disabled = false;
    resultsSection.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function resetForm() {
    fileInput.value = '';
    fileInfo.style.display = 'none';
    importBtn.disabled = true;
    resultsSection.style.display = 'none';
    dropZone.classList.remove('dragover');
}

// Form submission
importForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileInput.files[0]) {
        alert('Παρακαλώ επιλέξτε ένα αρχείο.');
        return;
    }

    // Show loading state
    importBtn.disabled = true;
    loadingSpinner.style.display = 'inline-block';
    importBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Εισαγωγή σε εξέλιξη...';

    const formData = new FormData();
    formData.append('jsonFile', fileInput.files[0]);

    try {
        const response = await fetch('/secretary/input', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log(result);
        displayResults(result);

    } catch (error) {
        console.error('Import error:', error);
        displayResults({
            success: false,
            message: 'Σφάλμα κατά την εισαγωγή: ' + error.message
        });
    } finally {
        // Reset button state
        importBtn.disabled = false;
        loadingSpinner.style.display = 'none';
        importBtn.innerHTML = 'Εισαγωγή Δεδομένων';
    }
});

function displayResults(result) {
    const summaryDiv = document.getElementById('importSummary');
    const detailsDiv = document.getElementById('importDetails');

    if (result.success) {
        summaryDiv.innerHTML = `
                    <div class="alert alert-success">
                        <h6><i class="fas fa-check-circle"></i> ${result.message}</h6>
                        ${result.summary ? `
                            <p class="mb-0">
                                <strong>Επιτυχείς:</strong> ${result.summary.totalSuccess} |
                                <strong>Αποτυχίες:</strong> ${result.summary.totalFailed}
                            </p>
                        ` : ''}
                    </div>
                `;

        if (result.results) {
            let detailsHtml = '<div class="row">';

            if (result.results.students) {
                detailsHtml += `
                            <div class="col-md-6">
                                <h6>Φοιτητές</h6>
                                <p>Επιτυχείς: ${result.results.students.success}</p>
                                <p>Αποτυχίες: ${result.results.students.failed}</p>
                            </div>
                        `;
            }

            if (result.results.professors) {
                detailsHtml += `
                            <div class="col-md-6">
                                <h6>Καθηγητές</h6>
                                <p>Επιτυχείς: ${result.results.professors.success}</p>
                                <p>Αποτυχίες: ${result.results.professors.failed}</p>
                            </div>
                        `;
            }

            detailsHtml += '</div>';
            detailsDiv.innerHTML = detailsHtml;
        }
    } else {
        summaryDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <h6><i class="fas fa-exclamation-triangle"></i> ${result.message}</h6>
                    </div>
                `;
        detailsDiv.innerHTML = '';
    }

    // Display errors if any
    if (result.errors && result.errors.length > 0) {
        const errorsHtml = `
                    <div class="mt-3">
                        <h6>Σφάλματα:</h6>
                        <div class="error-list alert alert-warning">
                            <ul class="mb-0">
                                ${result.errors.map(error => `<li>${error}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
        detailsDiv.innerHTML += errorsHtml;
    }

    if (result.summary && result.summary.errors && result.summary.errors.length > 0) {
        const errorsHtml = `
                    <div class="mt-3">
                        <h6>Σφάλματα:</h6>
                        <div class="error-list alert alert-warning">
                            <ul class="mb-0">
                                ${result.summary.errors.map(error => `<li>${error}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
        detailsDiv.innerHTML += errorsHtml;
    }

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
