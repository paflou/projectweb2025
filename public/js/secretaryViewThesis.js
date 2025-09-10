/**
 * Secretary View Thesis JavaScript
 * Handles the display and interaction for viewing active and under-review theses
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const noThesesState = document.getElementById('noThesesState');
    const thesesContainer = document.getElementById('thesesContainer');
    const thesesList = document.getElementById('thesesList');
    const thesisDetailsCard = document.getElementById('thesisDetailsCard');
    const selectThesisPlaceholder = document.getElementById('selectThesisPlaceholder');
    const thesisDetailsContent = document.getElementById('thesisDetailsContent');
    const thesisStatusBadge = document.getElementById('thesisStatusBadge');
    const refreshBtn = document.getElementById('refreshBtn');

    // State
    let currentTheses = [];
    let selectedThesisId = null;

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
                // Redirect to login page
                window.location.href = '/';
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Authentication/authorization error - redirect to login
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
                // Likely an HTML response instead of JSON - redirect to login
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
            listItem.className = 'list-group-item list-group-item-action';
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
     * Select and display details for a specific thesis
     */
    async function selectThesis(thesisId) {
        // Update UI selection
        document.querySelectorAll('.list-group-item-action').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-thesis-id="${thesisId}"]`).classList.add('active');
        
        selectedThesisId = thesisId;
        
        // Show loading in details panel
        thesisDetailsContent.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Φόρτωση...</span>
                </div>
                <p class="mt-2 text-muted">Φόρτωση λεπτομερειών...</p>
            </div>
        `;
        
        selectThesisPlaceholder.classList.add('d-none');
        thesisDetailsCard.classList.remove('d-none');
        
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

            displayThesisDetails(data.thesis);

        } catch (error) {
            console.error('Error loading thesis details:', error);
            if (error.message.includes('Unexpected token')) {
                window.location.href = '/';
                return;
            }
            thesisDetailsContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Σφάλμα κατά τη φόρτωση των λεπτομερειών: ${error.message}
                </div>
            `;
        }
    }

    /**
     * Display detailed thesis information
     */
    function displayThesisDetails(thesis) {
        // Update status badge
        thesisStatusBadge.className = `badge ${thesis.status_class}`;
        thesisStatusBadge.textContent = thesis.status_text;
        
        const timeElapsed = formatTimeElapsed(thesis.days_since_submission);
        const committeeMembers = thesis.committee_members || [];
        
        thesisDetailsContent.innerHTML = `
            <!-- Basic Information -->
            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="bi bi-journal-text me-2"></i>
                        Βασικές Πληροφορίες
                    </h4>
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${escapeHtml(thesis.title)}</h5>
                            <p class="card-text">${escapeHtml(thesis.description || 'Χωρίς περιγραφή')}</p>
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Ημερομηνία Υποβολής:</strong></p>
                                    <p class="text-muted">${formatDate(thesis.submission_date)}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Χρόνος από την Ανάθεση:</strong></p>
                                    <p class="text-muted">${timeElapsed}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Student Information -->
            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="bi bi-person me-2"></i>
                        Στοιχεία Φοιτητή
                    </h4>
                    <div class="card">
                        <div class="card-body">
                            ${generateStudentInfo(thesis)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Committee Information -->
            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="bi bi-people me-2"></i>
                        Τριμελής Επιτροπή
                    </h4>
                    <div class="card">
                        <div class="card-body">
                            ${generateCommitteeInfo(thesis, committeeMembers)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Exam Information (if applicable) -->
            ${thesis.exam_datetime ? generateExamInfo(thesis) : ''}
        `;
    }

    /**
     * Generate student information HTML
     */
    function generateStudentInfo(thesis) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <p class="mb-1"><strong>Όνομα:</strong></p>
                    <p class="text-muted">${escapeHtml(thesis.student_name || 'Δεν έχει οριστεί')}</p>
                    
                    <p class="mb-1"><strong>Email:</strong></p>
                    <p class="text-muted">${escapeHtml(thesis.student_email || 'Δεν έχει οριστεί')}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1"><strong>Αριθμός Μητρώου:</strong></p>
                    <p class="text-muted">${thesis.student_number || 'Δεν έχει οριστεί'}</p>
                    
                    <p class="mb-1"><strong>Τηλέφωνο:</strong></p>
                    <p class="text-muted">${thesis.student_mobile || thesis.student_landline || 'Δεν έχει οριστεί'}</p>
                </div>
            </div>
        `;
    }

    /**
     * Generate committee information HTML
     */
    function generateCommitteeInfo(thesis, committeeMembers) {
        let html = `
            <!-- Supervisor -->
            <div class="mb-3">
                <h6 class="text-success">
                    <i class="bi bi-person-check me-2"></i>
                    Επιβλέπων Καθηγητής
                </h6>
                <div class="ps-3">
                    <p class="mb-1"><strong>${escapeHtml(thesis.supervisor_name || 'Δεν έχει οριστεί')}</strong></p>
                    <p class="mb-1 text-muted">${escapeHtml(thesis.supervisor_topic || '')}</p>
                    <p class="mb-0 text-muted small">${escapeHtml(thesis.supervisor_email || '')}</p>
                </div>
            </div>
        `;

        // Committee Members
        if (committeeMembers.length > 0) {
            html += '<h6 class="text-info mb-3"><i class="bi bi-people me-2"></i>Μέλη Επιτροπής</h6>';
            
            committeeMembers.forEach((member, index) => {
                html += `
                    <div class="mb-3 ps-3">
                        <p class="mb-1"><strong>Μέλος ${index + 1}: ${escapeHtml(member.name)}</strong></p>
                        <p class="mb-1 text-muted">${escapeHtml(member.topic || '')}</p>
                        <p class="mb-0 text-muted small">${escapeHtml(member.email || '')}</p>
                    </div>
                `;
            });
        } else {
            html += `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Η τριμελής επιτροπή δεν έχει ολοκληρωθεί. Απαιτούνται ${2 - committeeMembers.length} επιπλέον μέλη.
                </div>
            `;
        }

        return html;
    }

    /**
     * Generate exam information HTML
     */
    function generateExamInfo(thesis) {
        return `
            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="bi bi-calendar-event me-2"></i>
                        Στοιχεία Εξέτασης
                    </h4>
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Ημερομηνία & Ώρα:</strong></p>
                                    <p class="text-muted">${formatDateTime(thesis.exam_datetime)}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Τρόπος Εξέτασης:</strong></p>
                                    <p class="text-muted">${thesis.exam_mode === 'in-person' ? 'Δια ζώσης' : 'Διαδικτυακά'}</p>
                                </div>
                            </div>
                            ${thesis.exam_location ? `
                                <p class="mb-1"><strong>Τοποθεσία/Σύνδεσμος:</strong></p>
                                <p class="text-muted">${escapeHtml(thesis.exam_location)}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
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

    function formatDate(dateString) {
        if (!dateString) return 'Δεν έχει οριστεί';
        return new Date(dateString).toLocaleDateString('el-GR');
    }

    function formatDateTime(dateString) {
        if (!dateString) return 'Δεν έχει οριστεί';
        return new Date(dateString).toLocaleString('el-GR');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
