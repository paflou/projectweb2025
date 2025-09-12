/**
 * Secretary Manage Thesis JavaScript
 * Handles the management interface for secretary thesis operations
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const noThesesState = document.getElementById('noThesesState');
    const thesesContainer = document.getElementById('thesesContainer');
    const thesesList = document.getElementById('thesesList');
    const thesisManagementCard = document.getElementById('thesisManagementCard');
    const selectThesisPlaceholder = document.getElementById('selectThesisPlaceholder');
    const thesisManagementContent = document.getElementById('thesisManagementContent');
    const thesisStatusBadge = document.getElementById('thesisStatusBadge');
    const refreshBtn = document.getElementById('refreshBtn');

    // State
    let currentTheses = [];
    let selectedThesisId = null;
    let selectedThesis = null;

    // Initialize
    loadTheses();

    // Event Listeners
    refreshBtn.addEventListener('click', loadTheses);

    /**
     * Load all active and under-review theses
     */
    async function loadTheses() {
        showLoadingState();

        try {
            const response = await fetch('/secretary/api/theses');

            // Check if response is HTML (redirect to login)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                window.location.href = '/';
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/';
                    return;
                }
                throw new Error(data.error || 'Failed to load theses');
            }

            currentTheses = data.theses || [];
            displayTheses();

        } catch (error) {
            console.error('Error loading theses:', error);
            if (error.message.includes('Unexpected token')) {
                window.location.href = '/';
                return;
            }
            showErrorState(error.message);
        }
    }

    /**
     * Display the list of theses
     */
    function displayTheses() {
        if (currentTheses.length === 0) {
            showNoThesesState();
            return;
        }

        // Clear previous content
        thesesList.innerHTML = '';
        
        // Group theses by status
        const activeTheses = currentTheses.filter(t => t.thesis_status === 'active');
        const underReviewTheses = currentTheses.filter(t => t.thesis_status === 'under-review');
        
        // Add active theses
        if (activeTheses.length > 0) {
            addThesesGroup('Ενεργές Διπλωματικές', activeTheses, 'success');
        }
        
        // Add under-review theses
        if (underReviewTheses.length > 0) {
            addThesesGroup('Υπό Εξέταση', underReviewTheses, 'info');
        }
        
        showThesesContainer();
    }

    /**
     * Add a group of theses to the list
     */
    function addThesesGroup(title, theses, badgeClass) {
        // Add group header
        const groupHeader = document.createElement('div');
        groupHeader.className = 'list-group-item bg-light fw-bold';
        groupHeader.innerHTML = `
            <i class="bi bi-folder me-2"></i>
            ${title} (${theses.length})
        `;
        thesesList.appendChild(groupHeader);
        
        // Add thesis items
        theses.forEach(thesis => {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.className = 'list-group-item list-group-item-action thesis-list-item';
            listItem.dataset.thesisId = thesis.id;
            
            const timeElapsed = formatTimeElapsed(thesis.days_since_submission);
            const committeeCount = thesis.committee_members ? thesis.committee_members.length : 0;
            
            listItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${escapeHtml(thesis.title)}</h6>
                    <small class="text-muted">${timeElapsed}</small>
                </div>
                <p class="mb-1 text-truncate">${escapeHtml(thesis.description || 'Χωρίς περιγραφή')}</p>
                <small class="text-muted">
                    <i class="bi bi-person me-1"></i>${escapeHtml(thesis.student_name || 'Χωρίς φοιτητή')}
                    <span class="ms-3">
                        <i class="bi bi-people me-1"></i>Επιτροπή: ${committeeCount + 1}/3
                    </span>
                </small>
            `;
            
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                selectThesis(thesis.id);
            });
            
            thesesList.appendChild(listItem);
        });
    }

    /**
     * Select and display management options for a specific thesis
     */
    async function selectThesis(thesisId) {
        // Update UI selection
        document.querySelectorAll('.thesis-list-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-thesis-id="${thesisId}"]`).classList.add('active');
        
        selectedThesisId = thesisId;
        
        // Show loading in management panel
        thesisManagementContent.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Φόρτωση...</span>
                </div>
                <p class="mt-2 text-muted">Φόρτωση λεπτομερειών...</p>
            </div>
        `;
        
        selectThesisPlaceholder.classList.add('d-none');
        thesisManagementCard.classList.remove('d-none');
        
        try {
            const response = await fetch(`/secretary/api/thesis/${thesisId}`);

            // Check if response is HTML (redirect to login)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                window.location.href = '/';
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/';
                    return;
                }
                throw new Error(data.error || 'Failed to load thesis details');
            }

            selectedThesis = data.thesis;
            displayThesisManagement(data.thesis);

        } catch (error) {
            console.error('Error loading thesis details:', error);
            if (error.message.includes('Unexpected token')) {
                window.location.href = '/';
                return;
            }
            thesisManagementContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Σφάλμα κατά τη φόρτωση των λεπτομερειών: ${error.message}
                </div>
            `;
        }
    }

    /**
     * Display thesis management options based on status
     */
    function displayThesisManagement(thesis) {
        // Update status badge
        thesisStatusBadge.className = `badge ${thesis.status_class}`;
        thesisStatusBadge.textContent = thesis.status_text;
        
        let managementHtml = `
            <!-- Basic Information -->
            <div class="mb-4">
                <h5 class="text-primary mb-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Βασικές Πληροφορίες
                </h5>
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${escapeHtml(thesis.title)}</h6>
                        <p class="card-text">${escapeHtml(thesis.description || 'Χωρίς περιγραφή')}</p>
                        <div class="row">
                            <div class="col-md-6">
                                <p class="mb-1"><strong>Φοιτητής:</strong></p>
                                <p class="text-muted">${escapeHtml(thesis.student_name || 'Δεν έχει οριστεί')}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1"><strong>Επιβλέπων:</strong></p>
                                <p class="text-muted">${escapeHtml(thesis.supervisor_name || 'Δεν έχει οριστεί')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Management Actions -->
            <div class="management-actions">
                <h5 class="text-primary mb-3">
                    <i class="bi bi-gear me-2"></i>
                    Ενέργειες Διαχείρισης
                </h5>
        `;

        // Add status-specific management options
        if (thesis.thesis_status === 'active') {
            managementHtml += generateActiveThesisActions(thesis);
        } else if (thesis.thesis_status === 'under-review') {
            managementHtml += generateUnderReviewThesisActions(thesis);
        }

        managementHtml += '</div>';
        thesisManagementContent.innerHTML = managementHtml;
        
        // Attach event listeners to action buttons
        attachActionEventListeners();
    }

    // Utility Functions
    function showLoadingState() {
        loadingState.classList.remove('d-none');
        errorState.classList.add('d-none');
        noThesesState.classList.add('d-none');
        thesesContainer.classList.add('d-none');
    }

    function showErrorState(message) {
        loadingState.classList.add('d-none');
        errorState.classList.remove('d-none');
        noThesesState.classList.add('d-none');
        thesesContainer.classList.add('d-none');
        errorMessage.textContent = message;
    }

    function showNoThesesState() {
        loadingState.classList.add('d-none');
        errorState.classList.add('d-none');
        noThesesState.classList.remove('d-none');
        thesesContainer.classList.add('d-none');
    }

    function showThesesContainer() {
        loadingState.classList.add('d-none');
        errorState.classList.add('d-none');
        noThesesState.classList.add('d-none');
        thesesContainer.classList.remove('d-none');
    }

    function formatTimeElapsed(days) {
        if (!days || days < 0) return 'Άγνωστο';
        
        if (days === 0) return 'Σήμερα';
        if (days === 1) return '1 ημέρα';
        if (days < 30) return `${days} ημέρες`;
        if (days < 365) {
            const months = Math.floor(days / 30);
            return months === 1 ? '1 μήνας' : `${months} μήνες`;
        }
        
        const years = Math.floor(days / 365);
        const remainingMonths = Math.floor((days % 365) / 30);
        
        let result = years === 1 ? '1 έτος' : `${years} έτη`;
        if (remainingMonths > 0) {
            result += remainingMonths === 1 ? ', 1 μήνας' : `, ${remainingMonths} μήνες`;
        }
        
        return result;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate management actions for active thesis
     */
    function generateActiveThesisActions(thesis) {
        let html = '';

        // AP Number Recording
        if (!thesis.ap_number) {
            html += `
                <div class="action-card">
                    <h6 class="text-success mb-3">
                        <i class="bi bi-journal-check me-2"></i>
                        Καταγραφή Αριθμού Πρακτικού (ΑΠ)
                    </h6>
                    <p class="text-muted mb-3">Καταγράψτε τον αριθμό πρακτικού της Γενικής Συνέλευσης που ενέκρινε την ανάθεση του θέματος.</p>
                    <form id="apNumberForm">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="apNumber" class="form-label">Αριθμός Πρακτικού</label>
                                <input type="text" class="form-control" id="apNumber" required>
                            </div>
                            <div class="col-md-6">
                                <label for="apYear" class="form-label">Έτος</label>
                                <input type="number" class="form-control" id="apYear" min="2020" max="2030" value="${new Date().getFullYear()}" required>
                            </div>
                        </div>
                        <div class="mt-3">
                            <button type="submit" class="btn btn-success">
                                <i class="bi bi-check-circle me-1"></i>
                                Καταγραφή ΑΠ
                            </button>
                        </div>
                    </form>
                </div>
            `;
        } else {
            html += `
                <div class="action-card">
                    <h6 class="text-success mb-3">
                        <i class="bi bi-check-circle me-2"></i>
                        Αριθμός Πρακτικού Καταγεγραμμένος
                    </h6>
                    <p class="text-muted">ΑΠ: ${thesis.ap_number}/${thesis.ap_year}</p>
                </div>
            `;
        }

        // Thesis Cancellation
        html += `
            <div class="action-card">
                <h6 class="text-danger mb-3">
                    <i class="bi bi-x-circle me-2"></i>
                    Ακύρωση Ανάθεσης Διπλωματικής
                </h6>
                <p class="text-muted mb-3">Ακυρώστε την ανάθεση της διπλωματικής εργασίας με απόφαση της Γενικής Συνέλευσης.</p>
                <button type="button" class="btn btn-outline-danger" data-bs-toggle="collapse" data-bs-target="#cancellationForm">
                    <i class="bi bi-x-circle me-1"></i>
                    Ακύρωση Ανάθεσης
                </button>
                <div class="collapse mt-3" id="cancellationForm">
                    <form id="cancellationFormElement">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="cancellationApNumber" class="form-label">Αριθμός Πρακτικού Ακύρωσης</label>
                                <input type="text" class="form-control" id="cancellationApNumber" required>
                            </div>
                            <div class="col-md-6">
                                <label for="cancellationApYear" class="form-label">Έτος</label>
                                <input type="number" class="form-control" id="cancellationApYear" min="2020" max="2030" value="${new Date().getFullYear()}" required>
                            </div>
                        </div>
                        <div class="mt-3">
                            <label for="cancellationReason" class="form-label">Λόγος Ακύρωσης</label>
                            <textarea class="form-control" id="cancellationReason" rows="3" placeholder="π.χ. κατόπιν αιτήματος του φοιτητή" required></textarea>
                        </div>
                        <div class="mt-3">
                            <button type="submit" class="btn btn-danger">
                                <i class="bi bi-x-circle me-1"></i>
                                Ακύρωση Διπλωματικής
                            </button>
                            <button type="button" class="btn btn-secondary ms-2" data-bs-toggle="collapse" data-bs-target="#cancellationForm">
                                Ακύρωση
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Generate management actions for under-review thesis
     */
    function generateUnderReviewThesisActions(thesis) {
        let html = '';

        // Mark as Completed
        const canComplete = thesis.grade && thesis.grade > 0 && thesis.final_repository_link;

        html += `
            <div class="action-card">
                <h6 class="text-primary mb-3">
                    <i class="bi bi-check-circle me-2"></i>
                    Ολοκλήρωση Διπλωματικής
                </h6>
                <p class="text-muted mb-3">Αλλάξτε την κατάσταση της διπλωματικής σε "Ολοκληρωμένη" αφού έχει καταγραφεί ο βαθμός και ο σύνδεσμος Νεμέρτη.</p>

                <div class="mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Βαθμός:</strong></p>
                            <p class="text-muted">${thesis.grade ? thesis.grade : 'Δεν έχει καταγραφεί'}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Σύνδεσμος Νεμέρτη:</strong></p>
                            <p class="text-muted">${thesis.final_repository_link ? 'Καταγεγραμμένος' : 'Δεν έχει καταγραφεί'}</p>
                        </div>
                    </div>
                </div>

                ${canComplete ? `
                    <button type="button" class="btn btn-primary" id="completeThesisBtn">
                        <i class="bi bi-check-circle me-1"></i>
                        Ολοκλήρωση Διπλωματικής
                    </button>
                ` : `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Για την ολοκλήρωση απαιτείται καταγραφή βαθμού και συνδέσμου Νεμέρτη.
                    </div>
                `}
            </div>
        `;



        return html;
    }

    /**
     * Attach event listeners to action buttons
     */
    function attachActionEventListeners() {
        // AP Number Form
        const apNumberForm = document.getElementById('apNumberForm');
        if (apNumberForm) {
            apNumberForm.addEventListener('submit', handleApNumberSubmit);
        }

        // Cancellation Form
        const cancellationForm = document.getElementById('cancellationFormElement');
        if (cancellationForm) {
            cancellationForm.addEventListener('submit', handleCancellationSubmit);
        }

        // Complete Thesis Button
        const completeThesisBtn = document.getElementById('completeThesisBtn');
        if (completeThesisBtn) {
            completeThesisBtn.addEventListener('click', handleCompleteThesis);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Δεν έχει οριστεί';
        return new Date(dateString).toLocaleDateString('el-GR');
    }

    /**
     * Handle AP number form submission
     */
    async function handleApNumberSubmit(e) {
        e.preventDefault();

        const apNumber = document.getElementById('apNumber').value.trim();
        const apYear = parseInt(document.getElementById('apYear').value);

        if (!apNumber || !apYear) {
            showAlert('Παρακαλώ συμπληρώστε όλα τα πεδία.', 'warning');
            return;
        }

        try {
            const response = await fetch(`/secretary/api/thesis/${selectedThesisId}/record-ap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apNumber, apYear })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(data.message, 'success');
                // Refresh the thesis details
                selectThesis(selectedThesisId);
            } else {
                showAlert(data.error, 'danger');
            }
        } catch (error) {
            console.error('Error recording AP number:', error);
            showAlert('Σφάλμα κατά την καταγραφή του αριθμού πρακτικού.', 'danger');
        }
    }

    /**
     * Handle cancellation form submission
     */
    async function handleCancellationSubmit(e) {
        e.preventDefault();

        const cancellationApNumber = document.getElementById('cancellationApNumber').value.trim();
        const cancellationApYear = parseInt(document.getElementById('cancellationApYear').value);
        const cancellationReason = document.getElementById('cancellationReason').value.trim();

        if (!cancellationApNumber || !cancellationApYear || !cancellationReason) {
            showAlert('Παρακαλώ συμπληρώστε όλα τα πεδία.', 'warning');
            return;
        }

        // Confirm cancellation
        if (!confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε την ανάθεση αυτής της διπλωματικής εργασίας;')) {
            return;
        }

        try {
            const response = await fetch(`/secretary/api/thesis/${selectedThesisId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cancellationApNumber,
                    cancellationApYear,
                    cancellationReason
                })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(data.message, 'success');
                // Refresh the thesis list since status changed
                loadTheses();
            } else {
                showAlert(data.error, 'danger');
            }
        } catch (error) {
            console.error('Error cancelling thesis:', error);
            showAlert('Σφάλμα κατά την ακύρωση της διπλωματικής εργασίας.', 'danger');
        }
    }

    /**
     * Handle complete thesis action
     */
    async function handleCompleteThesis() {
        // Confirm completion
        if (!confirm('Είστε σίγουροι ότι θέλετε να ολοκληρώσετε αυτή τη διπλωματική εργασία;')) {
            return;
        }

        try {
            const response = await fetch(`/secretary/api/thesis/${selectedThesisId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(data.message, 'success');
                // Refresh the thesis list since status changed
                loadTheses();
            } else {
                showAlert(data.error, 'danger');
            }
        } catch (error) {
            console.error('Error completing thesis:', error);
            showAlert('Σφάλμα κατά την ολοκλήρωση της διπλωματικής εργασίας.', 'danger');
        }
    }



    /**
     * Show alert message
     */
    function showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at the top of the management content
        thesisManagementContent.insertBefore(alertDiv, thesisManagementContent.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

});
