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

// Modal elements
const inviteProfessorModal = document.getElementById('inviteProfessorModal');
const professorInviteDetails = document.getElementById('professorInviteDetails');
const invitationMessage = document.getElementById('invitationMessage');
const confirmInviteBtn = document.getElementById('confirmInviteBtn');

// State variables
let currentThesis = null;
let selectedProfessor = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadThesisInfo();
});

function initializeEventListeners() {
    // Professor search
    if (searchProfessorBtn) {
        searchProfessorBtn.addEventListener('click', handleProfessorSearch);
    }
    
    if (professorSearch) {
        professorSearch.addEventListener('keypress', function(e) {
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
                startStatusPolling(); // Start polling for status changes
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
            break;
    }
}

// Load committee status
async function loadCommitteeStatus() {
    try {
        const response = await fetch('/student/committee-status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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
        showError(`Σφάλμα κατά την αποστολή πρόσκλησης: ${error.message}`);
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
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        showError('Μη υποστηριζόμενος τύπος αρχείου. Επιτρέπονται μόνο PDF, DOC, DOCX');
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

// Handle add link
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

        // Refresh links display (placeholder)
        // loadMaterialLinks();

    } catch (error) {
        console.error('Error adding link:', error);
        showError(`Σφάλμα κατά την προσθήκη συνδέσμου: ${error.message}`);
    } finally {
        addLinkBtn.disabled = false;
        addLinkBtn.innerHTML = '<i class="bi bi-plus"></i> Προσθήκη';
    }
}

// Handle save exam details
async function handleSaveExamDetails() {
    const examDateValue = examDate.value;
    const examTimeValue = examTime.value;
    const examTypeValue = examType.value;
    const examLocationValue = examLocation.value.trim();

    if (!examDateValue || !examTimeValue || !examTypeValue || !examLocationValue) {
        showError('Παρακαλώ συμπληρώστε όλα τα στοιχεία εξέτασης');
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

    // Basic URL validation
    try {
        new URL(repositoryLinkValue);
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
    const examLocationLabel = document.getElementById('examLocationLabel');
    const examLocationHelp = document.getElementById('examLocationHelp');

    if (examType.value === 'in-person') {
        examLocationLabel.textContent = 'Αίθουσα Εξέτασης';
        examLocation.placeholder = 'π.χ. Αίθουσα Α1, Κτίριο Μηχανικών';
        examLocationHelp.textContent = 'Εισάγετε την αίθουσα και το κτίριο όπου θα γίνει η εξέταση.';
    } else if (examType.value === 'online') {
        examLocationLabel.textContent = 'Σύνδεσμος Τηλεδιάσκεψης';
        examLocation.placeholder = 'π.χ. https://zoom.us/j/123456789';
        examLocationHelp.textContent = 'Εισάγετε τον σύνδεσμο για τη διαδικτυακή εξέταση.';
    } else {
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
        'completed': 'Ολοκληρωμένη'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'under-assignment': 'bg-warning text-dark',
        'active': 'bg-primary',
        'under-review': 'bg-info',
        'completed': 'bg-success'
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

function showError(message) {
    alert(message); // Replace with toast notification if available
}

function showSuccess(message) {
    alert(message); // Replace with toast notification if available
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start polling for thesis status changes
function startStatusPolling() {
    if (currentThesis && currentThesis.thesis_status === 'under-assignment') {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('/student/thesis-info');
                if (!response.ok) return;

                const data = await response.json();

                if (data.thesis && data.thesis.thesis_status !== currentThesis.thesis_status) {
                    // Status changed!
                    currentThesis = data.thesis;
                    displayThesisInfo(data.thesis);
                    showStatusSection(data.thesis.thesis_status);

                    if (data.thesis.thesis_status === 'active') {
                        showSuccess('Συγχαρητήρια! Η διπλωματική σας μεταβιβάστηκε σε κατάσταση "Ενεργή"! Δύο καθηγητές αποδέχτηκαν την πρόσκληση.');
                        clearInterval(pollInterval); // Stop polling

                        // Cancel any remaining pending invitations
                        await cancelRemainingInvitations();
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error);
            }
        }, 5000); // Check every 5 seconds
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

// Export functions for potential use by other scripts
window.manageThesis = {
    loadThesisInfo: loadThesisInfo,
    loadCommitteeStatus: loadCommitteeStatus,
    startStatusPolling: startStatusPolling
};
