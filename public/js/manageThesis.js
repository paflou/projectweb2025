// DOM Elements
const loadingState = document.getElementById('loadingState');
const noThesisState = document.getElementById('noThesisState');
const thesisInfoCard = document.getElementById('thesisInfoCard');
const thesisStatusBadge = document.getElementById('thesisStatusBadge');
const thesisTitle = document.getElementById('thesisTitle');
const thesisDescription = document.getElementById('thesisDescription');
const supervisorName = document.getElementById('supervisorName');
const assignmentDate = document.getElementById('assignmentDate');

// Status sections
const underAssignmentSection = document.getElementById('underAssignmentSection');
const underExaminationSection = document.getElementById('underExaminationSection');
const completedSection = document.getElementById('completedSection');

// Under Assignment elements
const committeeMembers = document.getElementById('committeeMembers');
const pendingInvitations = document.getElementById('pendingInvitations');
const professorSearch = document.getElementById('professorSearch');
const searchProfessorBtn = document.getElementById('searchProfessorBtn');
const professorSearchResults = document.getElementById('professorSearchResults');
const professorList = document.getElementById('professorList');
const inviteStatus = document.getElementById('inviteStatus');

// Under Examination elements
const thesisFileInput = document.getElementById('thesisFileInput');
const uploadThesisBtn = document.getElementById('uploadThesisBtn');
const currentThesisFile = document.getElementById('currentThesisFile');
const linkTitle = document.getElementById('linkTitle');
const linkUrl = document.getElementById('linkUrl');
const addLinkBtn = document.getElementById('addLinkBtn');
const existingLinks = document.getElementById('existingLinks');
const examDate = document.getElementById('examDate');
const examTime = document.getElementById('examTime');
const examType = document.getElementById('examType');
const examLocation = document.getElementById('examLocation');
const saveExamDetailsBtn = document.getElementById('saveExamDetailsBtn');
const repositoryLink = document.getElementById('repositoryLink');
const saveRepositoryBtn = document.getElementById('saveRepositoryBtn');

// Active elements
const downloadThesisBtn = document.getElementById('downloadThesisBtn');
const removeThesisBtn = document.getElementById('removeThesisBtn');
const examLocationRow = document.getElementById('examLocationRow');
const examLocationLabel = document.getElementById('examLocationLabel');
const examLocationHelp = document.getElementById('examLocationHelp');
const scheduledExamCard = document.getElementById('scheduledExamCard');
const displayExamDate = document.getElementById('displayExamDate');
const displayExamTime = document.getElementById('displayExamTime');
const displayExamType = document.getElementById('displayExamType');
const displayExamLocation = document.getElementById('displayExamLocation');
const examDetailsCard = document.getElementById('examDetailsCard');
const displayRepositoryLink = document.getElementById('displayRepositoryLink');
const savedRepositoryCard = document.getElementById('savedRepositoryCard');
const savedRepositoryLink = document.getElementById('savedRepositoryLink');
const editExamDetailsBtn = document.getElementById('editExamDetailsBtn');
const repositoryCard = document.getElementById('repositoryCard');
const editRepositoryBtn = document.getElementById('editRepositoryBtn');

// Modal elements
const inviteProfessorModal = document.getElementById('inviteProfessorModal');
const professorInviteDetails = document.getElementById('professorInviteDetails');
const invitationMessage = document.getElementById('invitationMessage');
const confirmInviteBtn = document.getElementById('confirmInviteBtn');

// State variables
let currentThesis = null;
let selectedProfessor = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadThesisInfo();

    initializeEventListeners();
    getRepositoryLink();
});

function initializeEventListeners() {
    // Professor search
    if (searchProfessorBtn) {
        searchProfessorBtn.addEventListener('click', handleProfessorSearch);
    }

    if (downloadThesisBtn) {
        downloadThesisBtn.addEventListener('click', () => {
            if (currentThesis && currentThesis.draft) {
                window.location.href = `/student/download-thesis/${currentThesis.draft}`;
            } else {
                showError('Δεν υπάρχει διαθέσιμη διπλωματική για λήψη');
            }
        });
    }

    if (removeThesisBtn) {
        removeThesisBtn.addEventListener('click', async () => {
            if (await showConfirm('Είστε σίγουροι ότι θέλετε να αφαιρέσετε το τρέχον αρχείο διπλωματικής;')) {
                removeCurrentDraft();
            }
        });
    }

    if (professorSearch) {
        professorSearch.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleProfessorSearch();
            }
        });
    }

    // Thesis upload
    if (uploadThesisBtn) {
        uploadThesisBtn.addEventListener('click', handleThesisUpload);
    }

    // Add material link
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', handleAddLink);
    }

    // Save exam details
    if (saveExamDetailsBtn) {
        saveExamDetailsBtn.addEventListener('click', handleSaveExamDetails);
    }

    // Save repository link
    if (saveRepositoryBtn) {
        saveRepositoryBtn.addEventListener('click', handleSaveRepository);

    }

    // Exam type change
    if (examType) {
        examType.addEventListener('change', handleExamTypeChange);
    }

    // Confirm invitation
    if (confirmInviteBtn) {
        confirmInviteBtn.addEventListener('click', handleConfirmInvite);
    }

    if (editExamDetailsBtn) {
        editExamDetailsBtn.addEventListener('click', () => {
            // populate form with existing details
            if (currentThesis && currentThesis.exam_datetime) {
                const examDateTime = new Date(currentThesis.exam_datetime);
                examDate.value = examDateTime.toISOString().split('T')[0];
                examTime.value = examDateTime.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
                examType.value = currentThesis.exam_mode;
                examLocation.value = currentThesis.exam_location;
                handleExamTypeChange();
            }
            // Show exam details form
            examDetailsCard.classList.remove('d-none');
            // Hide scheduled exam card
            scheduledExamCard.classList.add('d-none');
        });
    }

    if (editRepositoryBtn) {
        editRepositoryBtn.addEventListener('click', () => {
            // Populate input with existing link
            if (savedRepositoryLink && savedRepositoryLink.textContent) {
                repositoryLink.value = savedRepositoryLink.textContent;
            }
            // Show repository input
            repositoryCard.classList.remove('d-none');
            // Hide saved repository card
            savedRepositoryCard.classList.add('d-none');
        });
    }
}

async function removeCurrentDraft() {
    try {
        const response = await fetch('/student/remove-current-draft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        showSuccess('Το τρέχον αρχείο διπλωματικής αφαιρέθηκε επιτυχώς!');
        currentThesisFile.classList.add('d-none');
    } catch (error) {
        console.error('Error removing current thesis file:', error);
        showError('Σφάλμα κατά την αφαίρεση του αρχείου διπλωματικής');
    }
}

// Load thesis information
async function loadThesisInfo() {
    try {
        const response = await fetch('/student/thesis-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        hideLoadingState();

        if (!data.thesis) {
            showNoThesisState();
        } else {
            currentThesis = data.thesis;
            displayThesisInfo(data.thesis);
            showStatusSection(data.thesis.thesis_status);

            // Load additional data based on status
            if (data.thesis.thesis_status === 'under-assignment') {
                loadCommitteeStatus();
                checkStatus(); // Start polling for status changes
            }
            else if (data.thesis.thesis_status === 'under-review' || data.thesis.thesis_status === 'active') {
                getCurrentFile();
                loadMaterialLinks();
                if (data.thesis.exam_datetime !== null) {
                    console.log(data.thesis)
                    populateExamDetails(data.thesis.exam_datetime, data.thesis.exam_mode, data.thesis.exam_location);
                }
            }
        }

    } catch (error) {
        console.error('Error loading thesis info:', error);
        hideLoadingState();
        showError('Σφάλμα κατά τη φόρτωση των πληροφοριών διπλωματικής');
    }
}

// Display thesis information
function displayThesisInfo(thesis) {
    thesisTitle.textContent = thesis.title;
    thesisDescription.textContent = thesis.description || 'Δεν υπάρχει περιγραφή';
    supervisorName.textContent = `${thesis.supervisor_name} ${thesis.supervisor_surname}`;
    assignmentDate.textContent = new Date(thesis.submission_date).toLocaleDateString('el-GR');

    // Set status badge
    const statusText = getStatusText(thesis.thesis_status);
    const statusClass = getStatusClass(thesis.thesis_status);
    thesisStatusBadge.textContent = statusText;
    thesisStatusBadge.className = `badge ${statusClass}`;

    thesisInfoCard.classList.remove('d-none');
}

// Show appropriate status section
function showStatusSection(status) {
    // Hide all sections first
    underAssignmentSection.classList.add('d-none');
    underExaminationSection.classList.add('d-none');
    completedSection.classList.add('d-none');

    // Show appropriate section
    switch (status) {
        case 'under-assignment':
            underAssignmentSection.classList.remove('d-none');
            break;
        case 'under-review':
            underExaminationSection.classList.remove('d-none');
            break;
        case 'active':
            underExaminationSection.classList.remove('d-none');
            break;
        case 'completed':
            completedSection.classList.remove('d-none');
            setupCompletedThesisEventListeners();
            populateCompletedThesisInfo();
            break;
    }
}

// Load committee status
async function loadCommitteeStatus() {
    try {
        const response = await fetch(`/student/committee-status/${currentThesis.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        displayCommitteeStatus(data);

    } catch (error) {
        console.error('Error loading committee status:', error);
        showError('Σφάλμα κατά τη φόρτωση της κατάστασης επιτροπής');
    }
}

// Display committee status
function displayCommitteeStatus(status) {
    // Display accepted members
    committeeMembers.innerHTML = '';
    if (status.members && status.members.length > 0) {
        status.members.forEach(member => {
            const memberItem = createCommitteeMemberItem(member, 'accepted');
            committeeMembers.appendChild(memberItem);
        });
    } else {
        committeeMembers.innerHTML = '<div class="text-muted small">Δεν υπάρχουν αποδεκτά μέλη</div>';
    }

    // Display pending invitations
    pendingInvitations.innerHTML = '';
    if (status.pending && status.pending.length > 0) {
        status.pending.forEach(invitation => {
            const invitationItem = createCommitteeMemberItem(invitation, 'pending');
            pendingInvitations.appendChild(invitationItem);
        });
    } else {
        pendingInvitations.innerHTML = '<div class="text-muted small">Δεν υπάρχουν εκκρεμείς προσκλήσεις</div>';
    }


}

// Create committee member item
function createCommitteeMemberItem(member, type) {
    const item = document.createElement('div');
    item.className = 'list-group-item';

    const statusIcon = type === 'accepted' ?
        '<i class="bi bi-check-circle text-success me-2"></i>' :
        '<i class="bi bi-clock text-warning me-2"></i>';

    item.innerHTML = `
        ${statusIcon}
        <strong>${escapeHtml(member.name)} ${escapeHtml(member.surname)}</strong><br>
        <small class="text-muted">${escapeHtml(member.topic)} - ${escapeHtml(member.department)}</small>
    `;

    return item;
}

// Handle professor search
async function handleProfessorSearch() {
    const query = professorSearch.value.trim();

    if (query.length < 2) {
        showError('Παρακαλώ εισάγετε τουλάχιστον 2 χαρακτήρες για αναζήτηση');
        return;
    }

    try {
        searchProfessorBtn.disabled = true;
        searchProfessorBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Αναζήτηση...';

        const response = await fetch(`/student/search-professors?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayProfessorSearchResults(data.professors);

    } catch (error) {
        console.error('Error searching professors:', error);
        showError('Σφάλμα κατά την αναζήτηση καθηγητών');
    } finally {
        searchProfessorBtn.disabled = false;
        searchProfessorBtn.innerHTML = '<i class="bi bi-search"></i> Αναζήτηση';
    }
}

// Display professor search results
function displayProfessorSearchResults(professors) {
    professorList.innerHTML = '';

    if (!professors || professors.length === 0) {
        professorList.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="bi bi-search"></i>
                <p class="mb-0 mt-2">Δεν βρέθηκαν καθηγητές</p>
            </div>
        `;
        professorSearchResults.classList.remove('d-none');
        return;
    }

    professors.forEach(professor => {
        const listItem = createProfessorListItem(professor);
        professorList.appendChild(listItem);
    });

    professorSearchResults.classList.remove('d-none');
}

// Create professor list item
function createProfessorListItem(professor) {
    const listItem = document.createElement('div');
    listItem.className = 'list-group-item list-group-item-action';
    listItem.style.cursor = 'pointer';

    listItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6 class="mb-1">${escapeHtml(professor.name)} ${escapeHtml(professor.surname)}</h6>
                <p class="mb-1 text-muted small">${escapeHtml(professor.topic)}</p>
                <small class="text-muted">${escapeHtml(professor.department)} - ${escapeHtml(professor.university)}</small>
            </div>
            <small class="text-primary">Πρόσκληση</small>
        </div>
    `;

    listItem.addEventListener('click', () => showInviteModal(professor));

    return listItem;
}

// Show invite modal
function showInviteModal(professor) {
    selectedProfessor = professor;

    professorInviteDetails.innerHTML = `
        <strong>${escapeHtml(professor.name)} ${escapeHtml(professor.surname)}</strong><br>
        <small>${escapeHtml(professor.topic)}<br>
        ${escapeHtml(professor.department)} - ${escapeHtml(professor.university)}</small>
    `;

    invitationMessage.value = '';

    const modal = new bootstrap.Modal(inviteProfessorModal);
    modal.show();
}

// Handle confirm invite
async function handleConfirmInvite() {
    if (!selectedProfessor) {
        showError('Δεν έχει επιλεγεί καθηγητής');
        return;
    }

    try {
        confirmInviteBtn.disabled = true;
        confirmInviteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Αποστολή...';

        const response = await fetch('/student/invite-professor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                professorId: selectedProfessor.id,
                message: invitationMessage.value.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        showSuccess('Η πρόσκληση στάλθηκε επιτυχώς!');

        // Close modal
        const modal = bootstrap.Modal.getInstance(inviteProfessorModal);
        if (modal) {
            modal.hide();
        }

        // Refresh committee status
        loadCommitteeStatus();

        // Clear search results
        professorSearchResults.classList.add('d-none');
        professorSearch.value = '';

    } catch (error) {
        console.error('Error sending invitation:', error);
        showError(`Σφάλμα κατά την αποστολή πρόσκλησης: <br>${error.message}`);
    } finally {
        confirmInviteBtn.disabled = false;
        confirmInviteBtn.innerHTML = 'Αποστολή Πρόσκλησης';
    }
}

// Handle thesis upload
async function handleThesisUpload() {
    const file = thesisFileInput.files[0];

    if (!file) {
        showError('Παρακαλώ επιλέξτε αρχείο');
        return;
    }

    // Validate file type
    const allowedTypes = [
        'application/pdf',                                                          // PDF files
        'application/vnd.oasis.opendocument.text',                                  // ODT (OpenDocument Text)
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   // DOCX (modern Word)
    ];
    if (!allowedTypes.includes(file.type)) {
        showError('Μη υποστηριζόμενος τύπος αρχείου. Επιτρέπονται μόνο PDF, ODF, DOCX');
        return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
        showError('Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 50MB');
        return;
    }

    try {
        uploadThesisBtn.disabled = true;
        uploadThesisBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Ανέβασμα...';

        const formData = new FormData();
        formData.append('thesis', file);
        console.log(formData)
        const response = await fetch('/student/upload-thesis', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        showSuccess('Το αρχείο ανέβηκε επιτυχώς!');

        // Update current file display
        updateCurrentFileDisplay(data.filename);

        // Clear file input
        thesisFileInput.value = '';

    } catch (error) {
        console.error('Error uploading thesis:', error);
        showError(`Σφάλμα κατά το ανέβασμα: ${error.message}`);
    } finally {
        uploadThesisBtn.disabled = false;
        uploadThesisBtn.innerHTML = '<i class="bi bi-upload"></i> Ανέβασμα';
    }
}

// Handle add link for material (Google Drive, GitHub, etc.)
async function handleAddLink() {
    const title = linkTitle.value.trim();
    const url = linkUrl.value.trim();

    if (!title || !url) {
        showError('Παρακαλώ συμπληρώστε τίτλο και σύνδεσμο');
        return;
    }

    // Basic URL validation
    try {
        new URL(url);
    } catch {
        showError('Μη έγκυρος σύνδεσμος');
        return;
    }

    try {
        addLinkBtn.disabled = true;
        addLinkBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Προσθήκη...';

        const response = await fetch('/student/add-material-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        showSuccess('Ο σύνδεσμος προστέθηκε επιτυχώς!');

        // Clear inputs
        linkTitle.value = '';
        linkUrl.value = '';

        // Refresh links display
        loadMaterialLinks();

    } catch (error) {
        console.error('Error adding link:', error);
        showError(`Σφάλμα κατά την προσθήκη συνδέσμου: ${error.message}`);
    } finally {
        addLinkBtn.disabled = false;
        addLinkBtn.innerHTML = '<i class="bi bi-plus"></i> Προσθήκη';
    }
}

async function loadMaterialLinks() {
    try {
        const response = await fetch('/student/material-links', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Material Links:', data.links); // Debug log

        displayMaterialLinks(data.links);
    } catch (error) {
        console.error('Error loading material links:', error);
        showError('Σφάλμα κατά τη φόρτωση των συνδέσμων υλικού');
    }
}

function displayMaterialLinks(links) {
    existingLinks.innerHTML = '';
    if (!links || links.length === 0) {
        existingLinks.innerHTML = '<div class="text-muted small">Δεν υπάρχουν προστιθέμενοι σύνδεσμοι</div>';
        return;
    }

    links.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'list-group-item d-flex justify-content-between align-items-center';

        linkItem.innerHTML = `
            <div class="d-flex align-items-center">
                <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="m-2">
                <span class="me-2 text-truncate">
                    ${escapeHtml(link.url)}
                </span>
                </a>
            </div>
            <button class="btn btn-sm btn-outline-danger delete-link-btn" data-id="${link.id}">
                <i class="bi bi-trash"></i>
            </button>
        `;

        existingLinks.appendChild(linkItem);
    });

    // delete button listeners
    document.querySelectorAll('.delete-link-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            //console.log('Delete link with id:', id);

            if (await showConfirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον σύνδεσμο;')) {
                // Call delete API
                fetch(`/student/material-links/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        showSuccess('Ο σύνδεσμος διαγράφηκε επιτυχώς!');
                        loadMaterialLinks(); // Refresh links
                    })
                    .catch(error => {
                        console.error('Error deleting link:', error);
                        showError('Σφάλμα κατά τη διαγραφή του συνδέσμου');
                    });
            }
        });
    });
}


// Handle save exam details
async function handleSaveExamDetails() {
    const examDateValue = examDate.value;
    const examTimeValue = examTime.value;
    const examTypeValue = examType.value;
    const examLocationValue = examLocation.value.trim();

    console.log({ examDateValue, examTimeValue, examTypeValue, examLocationValue });

    if (!examDateValue || !examTimeValue || !examTypeValue || !examLocationValue) {
        showError('Παρακαλώ συμπληρώστε όλα τα στοιχεία εξέτασης');
        return;
    }

    if (examTypeValue === 'in-person' && examLocationValue.length < 5) {
        showError('Παρακαλώ εισάγετε έγκυρη αίθουσα και κτίριο για τη δια ζώσης εξέταση');
        return;
    }
    else if (examTypeValue === 'online') {
        try {
            new URL(examLocationValue);
        } catch {
            showError('Μη έγκυρος σύνδεσμος για τη διαδικτυακή εξέταση');
            return;
        }
    }

    let nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    let formatted = nextYear.toISOString().split('T')[0];

    if (examDateValue < new Date().toISOString().split('T')[0]) {
        showError('Η ημερομηνία εξέτασης δεν μπορεί να είναι στο παρελθόν');
        return;
    }
    else if (examDateValue > formatted) {
        showError('Η ημερομηνία εξέτασης δεν μπορεί να είναι πέρα από ένα έτος από σήμερα');
        return;
    }

    try {
        saveExamDetailsBtn.disabled = true;
        saveExamDetailsBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Αποθήκευση...';

        const response = await fetch('/student/save-exam-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                examDate: examDateValue,
                examTime: examTimeValue,
                examType: examTypeValue,
                examLocation: examLocationValue
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        showSuccess('Τα στοιχεία εξέτασης αποθηκεύτηκαν επιτυχώς!');
        populateExamDetails(`${examDateValue}T${examTimeValue}`, examTypeValue, examLocationValue);

    } catch (error) {
        console.error('Error saving exam details:', error);
        showError(`Σφάλμα κατά την αποθήκευση: ${error.message}`);
    } finally {
        saveExamDetailsBtn.disabled = false;
        saveExamDetailsBtn.innerHTML = '<i class="bi bi-save"></i> Αποθήκευση Στοιχείων Εξέτασης';
    }
}


// Handle save repository link
async function handleSaveRepository() {
    const repositoryLinkValue = repositoryLink.value.trim();

    if (!repositoryLinkValue) {
        showError('Παρακαλώ εισάγετε σύνδεσμο αποθετηρίου');
        return;
    }

    // URL validation
    try {
        const url = new URL(repositoryLinkValue);

        if (url.hostname !== 'nemertes.library.upatras.gr') {
            showError('Ο σύνδεσμος αποθετηρίου πρέπει να είναι από το nemertes.library.upatras.gr');
            return;
        }

    } catch {
        showError('Μη έγκυρος σύνδεσμος');
        return;
    }

    try {
        saveRepositoryBtn.disabled = true;
        saveRepositoryBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Αποθήκευση...';

        const response = await fetch('/student/save-repository-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                repositoryLink: repositoryLinkValue
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        showSuccess('Ο σύνδεσμος αποθετηρίου αποθηκεύτηκε επιτυχώς!');
        getRepositoryLink();
    } catch (error) {
        console.error('Error saving repository link:', error);
        showError(`Σφάλμα κατά την αποθήκευση: ${error.message}`);
    } finally {
        saveRepositoryBtn.disabled = false;
        saveRepositoryBtn.innerHTML = '<i class="bi bi-save"></i> Αποθήκευση';
    }
}

// Handle exam type change
function handleExamTypeChange() {
    if (examType.value === 'in-person') {
        examLocationRow.classList.remove('d-none');

        examLocationLabel.textContent = 'Αίθουσα Εξέτασης';
        examLocation.placeholder = 'π.χ. Αίθουσα Α1, Κτίριο Μηχανικών';
        examLocationHelp.textContent = 'Εισάγετε την αίθουσα και το κτίριο όπου θα γίνει η εξέταση.';
    } else if (examType.value === 'online') {
        examLocationRow.classList.remove('d-none');
        examLocationLabel.textContent = 'Σύνδεσμος Τηλεδιάσκεψης';
        examLocation.placeholder = 'π.χ. https://zoom.us/j/123456789';
        examLocationHelp.textContent = 'Εισάγετε τον σύνδεσμο για τη διαδικτυακή εξέταση.';
    } else {
        examLocationRow.classList.add('d-none');

        examLocationLabel.textContent = 'Τοποθεσία/Σύνδεσμος';
        examLocation.placeholder = 'Αίθουσα εξέτασης ή σύνδεσμος τηλεδιάσκεψης';
        examLocationHelp.textContent = 'Για δια ζώσης εξέταση: Αίθουσα και κτίριο. Για διαδικτυακή: Σύνδεσμος τηλεδιάσκεψης.';
    }
}

// Utility functions
function hideLoadingState() {
    loadingState.classList.add('d-none');
}
function showNoThesisState() {
    noThesisState.classList.remove('d-none');
}

function getStatusText(status) {
    const statusMap = {
        'under-assignment': 'Υπό Ανάθεση',
        'active': 'Ενεργή',
        'under-review': 'Υπό Εξέταση',
        'completed': 'Ολοκληρωμένη',
        'cancelled': 'Ακυρωμένη'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'under-assignment': 'bg-warning text-dark',
        'active': 'bg-primary',
        'under-review': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return classMap[status] || 'bg-secondary';
}

function updateCurrentFileDisplay(filename) {
    const currentFileName = document.getElementById('currentFileName');
    const uploadDate = document.getElementById('uploadDate');

    if (currentFileName && uploadDate) {
        currentFileName.textContent = filename;
        uploadDate.textContent = new Date().toLocaleDateString('el-GR');
        currentThesisFile.classList.remove('d-none');
    }
}

async function getCurrentFile() {
    try {
        const response = await fetch('/student/current-thesis-file', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.filename) {
            updateCurrentFileDisplay(data.filename);
        }
    } catch (error) {
        console.error('Error fetching current file:', error);
    }
}

function populateExamDetails(dateTime, type, location) {
    if (!dateTime) return;

    examDetailsCard.classList.add('d-none');
    console.log('Populating exam details:', dateTime, type, location);

    const examDateObj = new Date(dateTime);
    displayExamDate.textContent = examDateObj.toLocaleDateString('el-GR');
    displayExamTime.textContent = examDateObj.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    displayExamType.textContent = type === 'in-person' ? 'Δια Ζώσης' : 'Διαδικτυακή';
    displayExamLocation.textContent = location;
    scheduledExamCard.classList.remove('d-none');

    console.log('Original dateTime string:', dateTime);
    console.log('Parsed Date object:', new Date(dateTime));
    console.log('Localized format:', new Date(dateTime).toLocaleDateString('el-GR'));

}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function checkStatus() {
    try {
        const response = await fetch('/student/thesis-info');
        if (!response.ok) return;

        const data = await response.json();

        if (data.thesis && data.thesis.thesis_status !== currentThesis.thesis_status) {
            currentThesis = data.thesis;
            displayThesisInfo(data.thesis);
            showStatusSection(data.thesis.thesis_status);

            if (data.thesis.thesis_status === 'active') {
                showSuccess('Συγχαρητήρια! Η διπλωματική σας μεταβιβάστηκε σε κατάσταση "Ενεργή"! Δύο καθηγητές αποδέχτηκαν την πρόσκληση.');
                // Cancel any remaining pending invitations
                await cancelRemainingInvitations();
            }
        }
    } catch (error) {
        console.error('Error checking status once:', error);
    }
}
// Cancel remaining pending invitations (called from frontend)
async function cancelRemainingInvitations() {
    try {
        const response = await fetch('/student/cancel-pending-invitations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Pending invitations cancelled successfully');
        }
    } catch (error) {
        console.error('Error cancelling pending invitations:', error);
    }
}

async function getRepositoryLink() {
    try {
        const response = await fetch('/student/repository-link', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.repositoryLink) {
            repositoryLink.value = data.repositoryLink;
            displayRepositoryLink.href = data.repositoryLink;
            displayRepositoryLink.textContent = data.repositoryLink;

            // Show saved repository card, hide input
            savedRepositoryCard.classList.remove('d-none');
            repositoryCard.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error fetching repository link:', error);
    }
}

// Completed thesis functionality
function setupCompletedThesisEventListeners() {
    const viewCompletedReportBtn = document.getElementById('viewCompletedReportBtn');
    const downloadCompletedThesisBtn = document.getElementById('downloadCompletedThesisBtn');

    if (viewCompletedReportBtn) {
        viewCompletedReportBtn.addEventListener('click', viewExaminationReport);
    }

    if (downloadCompletedThesisBtn) {
        downloadCompletedThesisBtn.addEventListener('click', downloadFinalThesis);
    }

}

function viewExaminationReport() {
    window.open(`/thesis/report/${currentThesis.id}`, '_blank');
}

function downloadFinalThesis() {
    console.log(currentThesis)
    if (!currentThesis || !currentThesis.draft) {
        showError('Δεν υπάρχει διαθέσιμο αρχείο για λήψη.');
        return;
    }

    // Create download link for the final thesis
    const downloadLink = document.createElement('a');
    downloadLink.href = `/uploads/theses/${currentThesis.draft}`;
    downloadLink.download = currentThesis.draft;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showSuccess('Η λήψη του τελικού κειμένου ξεκίνησε.');
}

async function populateCompletedCommitteeMembers() {
    const completedCommitteeMembers = document.getElementById('completedCommitteeMembers');
    if (!completedCommitteeMembers || !currentThesis) return;

    try {
        // Fetch detailed thesis info to get committee member names
        const response = await fetch('/student/detailed-thesis-info');
        if (!response.ok) {
            throw new Error('Failed to fetch detailed thesis info');
        }

        const data = await response.json();
        const thesis = data.thesis;

        let committeeHtml = `
            <div class="mb-2">
                <strong>Επιβλέπων:</strong> ${thesis.supervisor_name} ${thesis.supervisor_surname}
                <br><small class="text-muted">${thesis.supervisor_topic || ''}</small>
            </div>
        `;

        if (thesis.member1_name) {
            committeeHtml += `
                <div class="mb-2">
                    <strong>Μέλος 1:</strong> ${thesis.member1_name} ${thesis.member1_surname}
                    <br><small class="text-muted">${thesis.member1_topic || ''}</small>
                </div>
            `;
        }

        if (thesis.member2_name) {
            committeeHtml += `
                <div class="mb-2">
                    <strong>Μέλος 2:</strong> ${thesis.member2_name} ${thesis.member2_surname}
                    <br><small class="text-muted">${thesis.member2_topic || ''}</small>
                </div>
            `;
        }

        completedCommitteeMembers.innerHTML = committeeHtml;

    } catch (error) {
        console.error('Error fetching committee members:', error);
        completedCommitteeMembers.innerHTML = '<p class="text-muted">Δεν ήταν δυνατή η φόρτωση των στοιχείων της επιτροπής.</p>';
    }
}

async function populateStatusHistory() {
    const statusHistory = document.getElementById('statusHistory');
    if (!statusHistory || !currentThesis) return;

    try {
        // Fetch thesis timeline/history
        const response = await fetch(`/student/thesis-timeline/${currentThesis.id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch thesis timeline');
        }

        const data = await response.json();
        const timeline = data.timeline || [];

        // Debug: log the timeline data
        console.log('Timeline data received:', timeline);

        if (timeline.length === 0) {
            statusHistory.innerHTML = '<p class="text-muted">Δεν υπάρχει διαθέσιμο ιστορικό.</p>';
            return;
        }

        // Create timeline HTML
        const timelineHtml = timeline.map(event => {
            const eventDate = new Date(event.event_date);
            let formattedDate = 'Άγνωστη ημερομηνία';
            let formattedTime = '';

            // Check if date is valid
            if (!isNaN(eventDate.getTime())) {
                formattedDate = eventDate.toLocaleDateString('el-GR');
                formattedTime = eventDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
            }

            let actionText = '';
            let iconClass = '';
            let badgeClass = '';

            switch (event.action) {
                case 'created':
                    actionText = 'Δημιουργία διπλωματικής';
                    iconClass = 'bi-plus-circle';
                    badgeClass = 'bg-primary';
                    break;
                case 'assigned':
                    actionText = 'Ανάθεση σε φοιτητή';
                    iconClass = 'bi-person-plus';
                    badgeClass = 'bg-info';
                    break;
                case 'active':
                    actionText = 'Ενεργοποίηση (πλήρης επιτροπή)';
                    iconClass = 'bi-check-circle';
                    badgeClass = 'bg-success';
                    break;
                case 'under_review':
                    actionText = 'Υποβολή για εξέταση';
                    iconClass = 'bi-eye';
                    badgeClass = 'bg-warning';
                    break;
                case 'completed':
                    actionText = 'Ολοκλήρωση διπλωματικής';
                    iconClass = 'bi-award';
                    badgeClass = 'bg-success';
                    break;
                case 'draft_updated':
                    actionText = 'Ενημέρωση κειμένου';
                    iconClass = 'bi-file-earmark-text';
                    badgeClass = 'bg-secondary';
                    break;

                case 'invitation_sent':
                    actionText = 'Αποστολή πρόσκλησης';
                    iconClass = 'bi-envelope';
                    badgeClass = 'bg-primary';
                    break;
                case 'exam_scheduled':
                    actionText = 'Προγραμματισμός εξέτασης';
                    iconClass = 'bi-calendar-event';
                    badgeClass = 'bg-info';
                    break;
                case 'marked as under review':
                    actionText = 'Μεταφορά σε υπό εξέταση';
                    iconClass = 'bi-eye';
                    badgeClass = 'bg-info';
                    break;
                case 'ap_number_recorded':
                    actionText = 'Καταγραφή αριθμού ΑΠ';
                    iconClass = 'bi-journal-check';
                    badgeClass = 'bg-warning';
                    break;
                case 'thesis_completed':
                    actionText = 'Ολοκλήρωση διπλωματικής';
                    iconClass = 'bi-award';
                    badgeClass = 'bg-success';
                    break;

                default:
                    actionText = event.action;
                    iconClass = 'bi-circle';
                    badgeClass = 'bg-secondary';
            }

            return `
                <div class="d-flex align-items-center mb-2">
                    <div class="me-3">
                        <span class="badge ${badgeClass}">
                            <i class="${iconClass}"></i>
                        </span>
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-medium">${actionText}</div>
                        <small class="text-muted">${formattedDate}${formattedTime ? ` στις ${formattedTime}` : ''}</small>
                    </div>
                </div>
            `;
        }).join('');

        statusHistory.innerHTML = timelineHtml;

    } catch (error) {
        console.error('Error fetching status history:', error);
        statusHistory.innerHTML = '<p class="text-muted">Δεν ήταν δυνατή η φόρτωση του ιστορικού.</p>';
    }
}

function populateCompletedThesisInfo() {
    if (!currentThesis) return;

    // Populate committee members
    populateCompletedCommitteeMembers();

    // Populate status history
    populateStatusHistory();

    // Populate exam details
    const completedExamDate = document.getElementById('completedExamDate');
    const completedExamTime = document.getElementById('completedExamTime');
    const completedExamType = document.getElementById('completedExamType');
    const completedExamLocation = document.getElementById('completedExamLocation');

    if (currentThesis.exam_datetime) {
        const examDate = new Date(currentThesis.exam_datetime);
        if (completedExamDate) completedExamDate.textContent = examDate.toLocaleDateString('el-GR');
        if (completedExamTime) completedExamTime.textContent = examDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    }

    if (completedExamType) {
        completedExamType.textContent = currentThesis.exam_mode === 'in-person' ? 'Δια ζώσης' :
            currentThesis.exam_mode === 'online' ? 'Διαδικτυακά' : 'Δεν διατίθεται';
    }

    if (completedExamLocation) {
        completedExamLocation.textContent = currentThesis.exam_location || 'Δεν διατίθεται';
    }

    // Populate final grade
    const finalGrade = document.getElementById('finalGrade');
    if (finalGrade) {
        finalGrade.textContent = currentThesis.grade ? currentThesis.grade : '-';
    }

    // Populate repository link
    const repositoryLinkBtn = document.getElementById('repositoryLinkBtn');
    if (repositoryLinkBtn && currentThesis.final_repository_link) {
        repositoryLinkBtn.href = currentThesis.final_repository_link;
        repositoryLinkBtn.classList.remove('d-none');
    } else if (repositoryLinkBtn) {
        repositoryLinkBtn.classList.add('d-none');
    }
}

// Export functions for potential use by other scripts
window.manageThesis = {
    loadThesisInfo: loadThesisInfo,
    loadCommitteeStatus: loadCommitteeStatus,
    checkStatus: checkStatus,
    setupCompletedThesisEventListeners: setupCompletedThesisEventListeners,
    populateCompletedThesisInfo: populateCompletedThesisInfo
};
