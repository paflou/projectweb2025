// DOM Elements
const studentSearchInput = document.getElementById('studentSearch');
const searchBtn = document.getElementById('searchBtn');
const studentResults = document.getElementById('studentResults');
const studentList = document.getElementById('studentList');
const selectedStudentSection = document.getElementById('selectedStudentSection');
const selectedStudentInfo = document.getElementById('selectedStudentInfo');
const changeStudentBtn = document.getElementById('changeStudentBtn');

// Topic-related DOM elements
const topicSearchInput = document.getElementById('topicSearch');
const availableTopicsList = document.getElementById('availableTopicsList');
const selectedTopicPreview = document.getElementById('selectedTopicPreview');
const selectedTopicInfo = document.getElementById('selectedTopicInfo');
const assignBtn = document.getElementById('assignBtn');
const assignmentStatus = document.getElementById('assignmentStatus');

// Temporary assignments DOM elements
const temporaryAssignments = document.getElementById('temporaryAssignments');
const noAssignmentsMessage = document.getElementById('noAssignmentsMessage');
const cancelAssignmentDetails = document.getElementById('cancelAssignmentDetails');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');

// State variables
let selectedStudent = null;
let selectedTopic = null;
let allTopics = [];
let currentAssignmentToCancel = null;

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadAvailableTopics();
    loadTemporaryAssignments();
});

function initializeEventListeners() {
    // Search button click event
    searchBtn.addEventListener('click', handleStudentSearch);

    // Enter key press in search input
    studentSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleStudentSearch();
        }
    });

    // Change student button click event
    changeStudentBtn.addEventListener('click', function() {
        clearStudentSelection();
        studentSearchInput.focus();
    });

    // Clear search results when input is cleared
    studentSearchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            hideSearchResults();
        }
    });

    // Topic search functionality
    topicSearchInput.addEventListener('input', function() {
        filterTopics(this.value.trim());
    });

    // Assign button click event
    assignBtn.addEventListener('click', handleAssignment);

    // Confirm cancel button click event
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', handleCancelAssignment);
    }
}

// Handle student search
async function handleStudentSearch() {
    const query = studentSearchInput.value.trim();
    
    if (query.length < 2) {
        showError('Παρακαλώ εισάγετε τουλάχιστον 2 χαρακτήρες για αναζήτηση');
        return;
    }
    
    try {
        // Show loading state
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Αναζήτηση...';
        
        // Make API call to search students
        const response = await fetch(`/prof/search-students?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displaySearchResults(data.students);
        
    } catch (error) {
        console.error('Error searching students:', error);
        showError('Σφάλμα κατά την αναζήτηση φοιτητών. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
        // Reset button state
        searchBtn.disabled = false;
        searchBtn.innerHTML = 'Αναζήτηση';
    }
}

// Display search results
function displaySearchResults(students) {
    // Clear previous results
    studentList.innerHTML = '';
    
    if (!students || students.length === 0) {
        studentList.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="bi bi-search"></i>
                <p class="mb-0 mt-2">Δεν βρέθηκαν φοιτητές</p>
            </div>
        `;
        showSearchResults();
        return;
    }
    
    // Create list items for each student
    students.forEach(student => {
        const listItem = createStudentListItem(student);
        studentList.appendChild(listItem);
    });
    
    showSearchResults();
}

// Create a list item for a student
function createStudentListItem(student) {
    const listItem = document.createElement('div');
    listItem.className = 'list-group-item list-group-item-action';
    listItem.style.cursor = 'pointer';
    
    listItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6 class="mb-1">${escapeHtml(student.name)} ${escapeHtml(student.surname)}</h6>
                <p class="mb-1 text-muted small">ΑΜ: ${student.student_number}</p>
                <small class="text-muted">${escapeHtml(student.email)}</small>
            </div>
            <small class="text-primary">Επιλογή</small>
        </div>
    `;
    
    // Add click event to select student
    listItem.addEventListener('click', () => selectStudent(student));
    
    return listItem;
}

// Select a student
function selectStudent(student) {
    selectedStudent = student;
    
    // Update selected student display
    selectedStudentInfo.innerHTML = `
        <strong>${escapeHtml(student.name)} ${escapeHtml(student.surname)}</strong><br>
        <small>ΑΜ: ${student.student_number} | ${escapeHtml(student.email)}</small>
    `;
    
    // Show selected student section and hide search results
    selectedStudentSection.classList.remove('d-none');
    hideSearchResults();
    
    // Clear search input
    studentSearchInput.value = '';

    // Update assignment status
    updateAssignmentStatus();

    console.log('Selected student:', selectedStudent);
}

// Clear student selection
function clearStudentSelection() {
    selectedStudent = null;
    selectedStudentSection.classList.add('d-none');
    hideSearchResults();
    studentSearchInput.value = '';
    updateAssignmentStatus();
}

// Load available topics from the server
async function loadAvailableTopics() {
    try {
        const response = await fetch('/prof/available-topics', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allTopics = data.topics || [];
        displayTopics(allTopics);

    } catch (error) {
        console.error('Error loading topics:', error);
        showError('Σφάλμα κατά τη φόρτωση των θεμάτων');
    }
}

// Display topics in the list
function displayTopics(topics) {
    availableTopicsList.innerHTML = '';

    if (!topics || topics.length === 0) {
        availableTopicsList.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="bi bi-inbox"></i>
                <p class="mb-0 mt-2">Δεν υπάρχουν διαθέσιμα θέματα</p>
            </div>
        `;
        return;
    }

    topics.forEach(topic => {
        const listItem = createTopicListItem(topic);
        availableTopicsList.appendChild(listItem);
    });
}

// Create a list item for a topic
function createTopicListItem(topic) {
    const listItem = document.createElement('div');
    listItem.className = 'list-group-item list-group-item-action';
    listItem.style.cursor = 'pointer';

    // Truncate description if too long
    const maxDescLength = 100;
    const truncatedDesc = topic.description && topic.description.length > maxDescLength
        ? topic.description.substring(0, maxDescLength) + '...'
        : topic.description || '';

    listItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <h6 class="mb-1">${escapeHtml(topic.title)}</h6>
                <p class="mb-1 text-muted small">${escapeHtml(truncatedDesc)}</p>
                <small class="text-muted">
                    ${topic.pdf && topic.pdf !== 'NULL' ? '<i class="bi bi-file-pdf me-1"></i>PDF διαθέσιμο' : ''}
                </small>
            </div>
            <small class="text-primary">Επιλογή</small>
        </div>
    `;

    // Add click event to select topic
    listItem.addEventListener('click', () => selectTopic(topic));

    return listItem;
}

// Select a topic
function selectTopic(topic) {
    selectedTopic = topic;

    // Update selected topic preview
    const truncatedDesc = topic.description && topic.description.length > 150
        ? topic.description.substring(0, 150) + '...'
        : topic.description || '';

    selectedTopicInfo.innerHTML = `
        <strong>${escapeHtml(topic.title)}</strong><br>
        <small class="text-muted">${escapeHtml(truncatedDesc)}</small>
        ${topic.pdf && topic.pdf !== 'NULL' ? '<br><small class="text-info"><i class="bi bi-file-pdf me-1"></i>PDF διαθέσιμο</small>' : ''}
    `;

    selectedTopicPreview.classList.remove('d-none');
    updateAssignmentStatus();

    console.log('Selected topic:', selectedTopic);
}

// Filter topics based on search query
function filterTopics(query) {
    if (!query) {
        displayTopics(allTopics);
        return;
    }

    const filteredTopics = allTopics.filter(topic =>
        topic.title.toLowerCase().includes(query.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(query.toLowerCase()))
    );

    displayTopics(filteredTopics);
}

// Update assignment status and button state
function updateAssignmentStatus() {
    const hasStudent = selectedStudent !== null;
    const hasTopic = selectedTopic !== null;

    if (hasStudent && hasTopic) {
        assignmentStatus.innerHTML = `
            <div class="text-success small">
                <i class="bi bi-check-circle me-1"></i>
                <p class="mb-0">Έτοιμο για ανάθεση</p>
            </div>
        `;
        assignBtn.disabled = false;
    } else {
        let message = 'Επιλέξτε ';
        if (!hasStudent && !hasTopic) {
            message += 'φοιτητή και θέμα';
        } else if (!hasStudent) {
            message += 'φοιτητή';
        } else {
            message += 'θέμα';
        }

        assignmentStatus.innerHTML = `
            <div class="text-muted small">
                <p class="mb-0">${message}</p>
            </div>
        `;
        assignBtn.disabled = true;
    }
}

// Handle assignment
async function handleAssignment() {
    if (!selectedStudent || !selectedTopic) {
        showError('Παρακαλώ επιλέξτε φοιτητή και θέμα');
        return;
    }

    // Show confirmation dialog
    const confirmed = confirm(
        `Θέλετε να αναθέσετε το θέμα "${selectedTopic.title}" στον φοιτητή ${selectedStudent.name} ${selectedStudent.surname} (ΑΜ: ${selectedStudent.student_number});`
    );

    if (!confirmed) {
        return;
    }

    try {
        // Show loading state
        assignBtn.disabled = true;
        assignBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Ανάθεση...';

        // Make API call to assign thesis
        const response = await fetch('/prof/assign-thesis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                thesisId: selectedTopic.id,
                studentId: selectedStudent.id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        await response.json(); // Consume the response
        showSuccess('Η ανάθεση ολοκληρώθηκε επιτυχώς!');

        // Refresh page contents instead of full reload
        await refreshPageContents();

    } catch (error) {
        console.error('Error during assignment:', error);
        showError(`Σφάλμα κατά την ανάθεση: ${error.message}`);
    } finally {
        // Reset button state
        assignBtn.disabled = false;
        assignBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Ανάθεση';
    }
}

// Reset assignment form
function resetAssignmentForm() {
    clearStudentSelection();
    selectedTopic = null;
    selectedTopicPreview.classList.add('d-none');
    topicSearchInput.value = '';
    displayTopics(allTopics);
    updateAssignmentStatus();
    // Reload temporary assignments to reflect changes
    loadTemporaryAssignments();
}

// Refresh page contents without full page reload
async function refreshPageContents() {
    try {
        // Reset form state
        clearStudentSelection();
        selectedTopic = null;
        selectedTopicPreview.classList.add('d-none');
        topicSearchInput.value = '';
        currentAssignmentToCancel = null;

        // Reload all data from server
        await Promise.all([
            loadAvailableTopics(),
            loadTemporaryAssignments()
        ]);

        // Update UI state
        updateAssignmentStatus();

    } catch (error) {
        console.error('Error refreshing page contents:', error);
        showError('Σφάλμα κατά την ανανέωση των δεδομένων');
    }
}

// Load temporary assignments from the server
async function loadTemporaryAssignments() {
    try {
        const response = await fetch('/prof/temporary-assignments', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayTemporaryAssignments(data.assignments || []);

    } catch (error) {
        console.error('Error loading temporary assignments:', error);
        showError('Σφάλμα κατά τη φόρτωση των προσωρινών αναθέσεων');
    }
}

// Display temporary assignments
function displayTemporaryAssignments(assignments) {
    temporaryAssignments.innerHTML = '';

    if (!assignments || assignments.length === 0) {
        noAssignmentsMessage.classList.remove('d-none');
        return;
    }

    noAssignmentsMessage.classList.add('d-none');

    assignments.forEach(assignment => {
        const listItem = createTemporaryAssignmentItem(assignment);
        temporaryAssignments.appendChild(listItem);
    });
}

// Create a list item for a temporary assignment
function createTemporaryAssignmentItem(assignment) {
    const listItem = document.createElement('div');
    listItem.className = 'list-group-item';

    const assignmentDate = new Date(assignment.submission_date).toLocaleDateString('el-GR');

    // Calculate committee status
    const pendingInvitations = parseInt(assignment.pending_invitations) || 0;
    const acceptedInvitations = parseInt(assignment.accepted_invitations) || 0;
    const needsMoreAccepted = acceptedInvitations < 2;

    // Create committee status message
    let committeeStatus = '';
    if (needsMoreAccepted) {
        const remainingAccepted = 2 - acceptedInvitations;
        committeeStatus = `
            <small class="text-warning">
                <i class="bi bi-exclamation-triangle me-1"></i>
                Χρειάζονται ${remainingAccepted} επιπλέον αποδοχές επιτροπής
            </small>
        `;

        // Show pending invitations if any
        if (pendingInvitations > 0) {
            committeeStatus += `<br>
                <small class="text-info">
                    <i class="bi bi-clock me-1"></i>
                    ${pendingInvitations} εκκρεμείς προσκλήσεις
                </small>
            `;
        }
    } else {
        committeeStatus = `
            <small class="text-success">
                <i class="bi bi-check-circle me-1"></i>
                Επιτροπή ολοκληρώθηκε: ${acceptedInvitations} αποδεκτές
            </small>
        `;
    }

    listItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <h6 class="mb-1">${escapeHtml(assignment.title)}</h6>
                <p class="mb-1 text-muted small">
                    <strong>Φοιτητής:</strong> ${escapeHtml(assignment.student_name)} ${escapeHtml(assignment.student_surname)}
                    (ΑΜ: ${assignment.student_number})
                </p>
                <small class="text-muted">
                    <i class="bi bi-calendar me-1"></i>Ανατέθηκε: ${assignmentDate}
                </small><br>
                ${committeeStatus}
            </div>
            <button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#cancelAssignmentModal">
                <i class="bi bi-x-circle me-1"></i>Ακύρωση
            </button>
        </div>
    `;

    // Add click event to cancel button
    const cancelBtn = listItem.querySelector('button');
    cancelBtn.addEventListener('click', () => showCancelConfirmation(assignment));

    return listItem;
}

// Show cancel confirmation modal
function showCancelConfirmation(assignment) {
    currentAssignmentToCancel = assignment;

    cancelAssignmentDetails.innerHTML = `
        <div>
            <strong>Θέμα:</strong> ${escapeHtml(assignment.title)}<br>
            <strong>Φοιτητής:</strong> ${escapeHtml(assignment.student_name)} ${escapeHtml(assignment.student_surname)}
            (ΑΜ: ${assignment.student_number})<br>
            <strong>Ημερομηνία Ανάθεσης:</strong> ${new Date(assignment.submission_date).toLocaleDateString('el-GR')}
        </div>
    `;
}

// Handle assignment cancellation
async function handleCancelAssignment() {
    if (!currentAssignmentToCancel) {
        showError('Δεν έχει επιλεγεί ανάθεση για ακύρωση');
        return;
    }

    try {
        confirmCancelBtn.disabled = true;
        confirmCancelBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Ακύρωση...';

        const response = await fetch(`/prof/cancel-under-assignment/${currentAssignmentToCancel.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        await response.json(); // Consume the response
        showSuccess('Η ανάθεση ακυρώθηκε επιτυχώς!');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cancelAssignmentModal'));
        if (modal) {
            modal.hide();
        }

        // Refresh page contents
        await refreshPageContents();

    } catch (error) {
        console.error('Error during cancellation:', error);
        showError(`Σφάλμα κατά την ακύρωση: ${error.message}`);
    } finally {
        // Reset button state
        confirmCancelBtn.disabled = false;
        confirmCancelBtn.innerHTML = 'Ακύρωση Ανάθεσης';
    }
}

// Show search results
function showSearchResults() {
    studentResults.classList.remove('d-none');
}

// Hide search results
function hideSearchResults() {
    studentResults.classList.add('d-none');
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for potential use by other scripts
window.assignThesis = {
    getSelectedStudent: () => selectedStudent,
    getSelectedTopic: () => selectedTopic,
    clearStudentSelection: clearStudentSelection,
    resetAssignmentForm: resetAssignmentForm,
    loadTemporaryAssignments: loadTemporaryAssignments,
    refreshPageContents: refreshPageContents
};
