// === General Elements ===
const loadingState = document.getElementById('loadingState');
const noThesisState = document.getElementById('noThesisState');
const thesisManagementCard = document.getElementById('thesisManagementCard');

// === Thesis Info ===
const thesisStatusBadge = document.getElementById('thesisStatusBadge');
const thesisTitle = document.getElementById('thesisTitle');
const thesisDescription = document.getElementById('thesisDescription');
const studentName = document.getElementById('studentName');
const supervisorName = document.getElementById('supervisorName');
const member1Name = document.getElementById('member1Name');
const member2Name = document.getElementById('member2Name');

// === Sections ===
const pendingAssignmentSection = document.getElementById('pendingAssignmentSection');
const committeeInvitationsTable = document.getElementById('committeeInvitationsTable');
const cancelAssignmentBtn = document.getElementById('cancelAssignmentBtn');

const activeThesisSection = document.getElementById('activeThesisSection');
const notesList = document.getElementById('notesList');
const newNoteInput = document.getElementById('newNoteInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const supervisorActionsActive = document.getElementById('supervisorActionsActive');
const cancelAfter2YearsBtn = document.getElementById('cancelAfter2YearsBtn');
const cancelAfter2YearsDesc = document.getElementById('cancelAfter2YearsDesc');

const markAsUnderReviewBtn = document.getElementById('markAsUnderReviewBtn');

const underReviewSection = document.getElementById('underReviewSection');
const viewDraftBtn = document.getElementById('viewDraftBtn');
const announcementSection = document.getElementById('announcementSection');

const gradingSection = document.getElementById('gradingSection');
const gradesTable = document.getElementById('gradesTable');
const saveGradeBtn = document.getElementById('saveGradeBtn');


const cancelAssignmentModal = document.getElementById('cancelAssignmentModal');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const assemblyYearField = document.getElementById('assemblyYear');
const assemblyNumberField = document.getElementById('assemblyNumber');


const openGradeModalBtn = document.getElementById('openGradeModalBtn');
const gradeModalEl = document.getElementById('gradeModal');
const gradeModal = new bootstrap.Modal(gradeModalEl);


const thesisId = window.location.pathname.split('/').pop();


// === Page Initialization ===
document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
});

openGradeModalBtn.addEventListener('click', () => {
    gradeModal.show();
    document.getElementById('gradeForm').reset();
    document.getElementById('totalGrade').value = '';
});

async function initializePage() {
    try {
        const thesis = await fetchThesisData();
        if (!thesis) return showNoThesisState();

        hideLoading();
        renderThesisDetails(thesis);
        renderSections(thesis);
        setupEventListeners(thesis);
    } catch (err) {
        console.error('Error initializing page:', err);
        showNoThesisState();
    }
}


// === Data Fetching ===
async function fetchThesisData() {
    const response = await fetch(`/prof/get-specific-thesis/${thesisId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.thesis || null;
}

async function fetchInvitations() {
    const response = await fetch(`/prof/get-thesis-invitations/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function fetchNotes() {
    const response = await fetch(`/prof/get-notes/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function fetchAssignmentDate() {
    const response = await fetch(`/prof/get-assignment-date/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function checkPresentation() {
    const response = await fetch(`/prof/get-presentation-date/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

// === DOM Rendering ===
function hideLoading() {
    loadingState.classList.add('d-none');
    thesisManagementCard.classList.remove('d-none');
}

function showNoThesisState() {
    loadingState.classList.add('d-none');
    noThesisState.classList.remove('d-none');
    thesisManagementCard.classList.add('d-none');
}

function renderThesisDetails(thesis) {
    thesisTitle.textContent = thesis.title;
    thesisDescription.textContent = thesis.description;
    studentName.textContent = thesis.student_name;
    supervisorName.textContent = thesis.supervisor_name;
    member1Name.textContent = thesis.member1_name || '—';
    member2Name.textContent = thesis.member2_name || '—';
    thesisStatusBadge.textContent = getStatusText(thesis.status);
}

async function renderSections(thesis) {
    // Get professor role
    const role = await checkRole(thesisId);

    // Hide all sections first
    pendingAssignmentSection.classList.add('d-none');
    activeThesisSection.classList.add('d-none');
    underReviewSection.classList.add('d-none');

    // Show section depending on status
    switch (thesis.status) {
        case 'under-assignment':
            pendingAssignmentSection.classList.remove('d-none');
            populateInvitationTable();
            break;
        case 'active':
            activeThesisSection.classList.remove('d-none');
            populateNoteField();
            if (role === 'supervisor')
                setUpSupervisorActionsForActiveThesis(thesisId);
            break;
        case 'under-review':
            setUpUnderReview();
            if (role === 'supervisor')
                setUpSupervisorActionsForUnderReview();
        case 'completed':
            break;
    }
}
async function setUpSupervisorActionsForUnderReview() {
    const generateAnnouncementBtn = document.getElementById('generateAnnouncementBtn');

    const date = await checkPresentation();
    console.log(date)

    if (date.exam_datetime === null || date.exam_mode === null || date.exam_location === null)
        return;
    else {
        generateAnnouncementBtn.classList.remove('disabled')
    }


}

function setUpUnderReview() {
    const viewDraftBtn = document.getElementById('viewDraftBtn');

    viewDraftBtn.addEventListener('click', () => {
        window.location.href = `/prof/download-thesis/${thesisId}`;
    });
    underReviewSection.classList.remove('d-none');
}

// === Event Listeners ===
function setupEventListeners(thesis) {
    if (cancelAssignmentBtn) {
        cancelAssignmentBtn.addEventListener('click', async () => {
            const confirmCancel = confirm("Είστε σίγουροι ότι θέλετε να ακυρώσετε την ανάθεση;");
            if (!confirmCancel) return;

            try {
                await cancelAssignment(thesis.id);
                document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
                    window.location.href = '/prof/view_thesis';
                }, { once: true });
            } catch (err) {
                console.error("Error in cancellation:", err);
                alert("Υπήρξε σφάλμα κατά την ακύρωση της ανάθεσης.");
            }
        });
    }
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', addNewNote);

        newNoteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewNote();
            }
        });
    }

    // TODO: Add listeners for notes, grading, under-review actions here
}

async function setUpSupervisorActionsForActiveThesis(thesisId) {
    try {
        console.log("getting assignment date")
        // Get thesis assignment date
        const date = await fetchAssignmentDate(thesisId);

        const assignmentDate = new Date(date);
        console.log(assignmentDate)
        const now = new Date();

        // Check if 2 years have passed
        const twoYearsLater = assignmentDate;
        twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
        if (now >= twoYearsLater) {
            cancelAfter2YearsBtn.disabled = false; // Enable button
            cancelAfter2YearsDesc.textContent = 'Μπορείτε να ακυρώσετε την ανάθεση.';

        } else {
            cancelAfter2YearsBtn.disabled = true;
            const remaining = Math.ceil((twoYearsLater - now) / (1000 * 60 * 60 * 24));
            cancelAfter2YearsDesc.textContent = `Η ακύρωση θα είναι διαθέσιμη σε ${remaining} ημέρες.`;
        }

    } catch (error) {
        console.error(error);
        cancelAfter2YearsDesc.textContent = 'Δεν ήταν δυνατή η φόρτωση της ημερομηνίας ανάθεσης.';
    }

    // Show the modal when the button is clicked
    cancelAfter2YearsBtn.addEventListener('click', () => {
        const modal = bootstrap.Modal.getOrCreateInstance(cancelAssignmentModal);
        modal.show();
    });

    // Reset modal content whenever it opens
    cancelAssignmentModal.addEventListener('show.bs.modal', () => {
        const form = cancelAssignmentModal.querySelector('#cancelAssignmentForm'); // note the #
        if (form) form.reset(); // clear inputs

        const statusText = cancelAssignmentModal.querySelector('#statusText');
        if (statusText) {
            statusText.innerText = '';
            statusText.classList.add('d-none');
            statusText.classList.remove('text-danger', 'text-success');
        }
    });

    assemblyYear.addEventListener('input', () => {
        const val = assemblyYear.value;
        if (val.length > 4) assemblyYear.value = val.slice(0, 4);
    });

    confirmCancelBtn.addEventListener('click', async () => {
        try {
            const assemblyNumber = assemblyNumberField.value
            const assemblyYear = assemblyYearField.value;

            if (isNaN(assemblyYear) || assemblyYear < 1900 || assemblyYear > currentYear) {
                showError('Εισάγετε ένα έτος από το 2000 έως το τρέχον έτος.');
                return;
            }

            //console.log(assemblyNumber)
            //console.log(assemblyYear)

            const res = await fetch(`/prof/cancel-active-assignment/${thesisId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assemblyNumber, assemblyYear })
            });
            const response = await res.json();
            if (res.ok) showSuccess("Η ανάθεση ακυρώθηκε επιτυχώς");
            else showError(`Σφάλμα: ${response.error}`);
        } catch (err) {
            console.error(err);
            showError("Παρουσιάστηκε σφάλμα κατά την ακύρωση.");
        }
    });

    // 4. Mark as under review button
    markAsUnderReviewBtn.addEventListener('click', async () => {
        if (!confirm("Μεταφορά σε Υπό Εξέταση;")) return;
        try {
            const res = await fetch(`/prof/mark-under-review/${thesisId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await res.json();

            if (res.ok) showSuccess("Η κατάσταση της διπλωματικής ενημερώθηκε επιτυχώς σε Υπό Εξέταση.");
            else showError(`Σφάλμα: ${result.error}`);
        } catch (err) {
            console.error(err);
            alert("Παρουσιάστηκε σφάλμα κατά την αλλαγή κατάστασης.");
        }
    });
    supervisorActionsActive.classList.remove('d-none');


    const successModalEl = document.getElementById('successModal');
    const errorModalEl = document.getElementById('errorModal');

    successModalEl.addEventListener('hidden.bs.modal', () => {
        location.reload(); // refresh the page when modal is fully hidden
    });

    errorModalEl.addEventListener('hidden.bs.modal', () => {
        location.reload(); // refresh the page when modal is fully hidden
    });
}


// === Cancel Assignment ===
async function cancelAssignment(id) {
    const response = await fetch('/prof/cancel-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thesisId: id })
    });

    let data;
    try {
        data = await response.json();
    } catch (err) {
        console.error("Error parsing JSON:", err);
        throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    showSuccess('Η ανάθεση ακυρώθηκε επιτυχώς!');
}


// === Invitations Table ===
async function populateInvitationTable() {
    const invitations = await fetchInvitations();
    committeeInvitationsTable.innerHTML = '';

    if (!invitations || invitations.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" class="text-center text-muted">Δεν υπάρχουν προσκλήσεις</td>`;
        committeeInvitationsTable.appendChild(tr);
        return;
    }

    invitations.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inv.professor_name}</td>
            <td>${inv.sent_at ? new Date(inv.sent_at).toLocaleString() : '-'}</td>
            <td>${inv.replied_at ? new Date(inv.replied_at).toLocaleString() : '-'}</td>
            <td>${getStatusBadge(inv.status)}</td>
        `;
        committeeInvitationsTable.appendChild(tr);
    });
}


async function populateNoteField() {
    const notes = await fetchNotes();
    notesList.innerHTML = '';

    if (!notes || notes.length === 0 || !Array.isArray(notes)) {
        notesList.innerHTML = `<p class="text-muted mb-0">Δεν υπάρχουν σημειώσεις.</p>`;
        return;
    }

    notes.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-item mb-2 p-2 border rounded d-flex justify-content-between align-items-center';

        // Hidden ID field
        const hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.value = note.id;
        hiddenId.className = 'note-id';
        div.appendChild(hiddenId);

        // Note text
        const noteText = document.createElement('span');
        noteText.textContent = note.note;
        noteText.className = 'note-text flex-grow-1';
        div.appendChild(noteText);

        // Buttons container
        const btnContainer = document.createElement('div');
        btnContainer.className = 'btn-group ms-2';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = 'Edit note';
        editBtn.addEventListener('click', () => editNote(note.id, noteText));
        btnContainer.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.title = 'Delete note';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));
        btnContainer.appendChild(deleteBtn);

        div.appendChild(btnContainer);
        notesList.appendChild(div);
    });

}

async function deleteNote(noteId) {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη σημείωση;')) return;

    try {
        const response = await fetch('/prof/delete-thesis-note', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noteId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete note.');
        }

        // Refresh the notes list
        populateNoteField();

    } catch (err) {
        console.error('Error deleting note:', err);
        alert('Υπήρξε σφάλμα κατά τη διαγραφή της σημείωσης.');
    }
}

async function editNote(noteId, noteTextElement) {
    const newText = prompt('Επεξεργαστείτε τη σημείωση:', noteTextElement.textContent);
    if (!newText || newText.trim().length === 0) return;

    if (newText.length > 300) {
        alert('Η σημείωση δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.');
        return;
    }

    try {
        const response = await fetch('/prof/edit-thesis-note', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noteId, text: newText.trim() })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to edit note.');
        }

        // Update the text in the DOM
        noteTextElement.textContent = newText.trim();

    } catch (err) {
        console.error('Error editing note:', err);
        alert('Υπήρξε σφάλμα κατά την επεξεργασία της σημείωσης.');
    }
}

async function addNewNote() {
    const noteText = newNoteInput.value.trim();
    if (!noteText) return;

    if (noteText.length > 300) {
        alert("Η σημείωση δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.");
        return;
    }

    try {
        const response = await fetch(`/prof/add-thesis-note`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thesisId, text: noteText })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        newNoteInput.value = ''; // clear input
        await populateNoteField(); // refresh notes list
    } catch (err) {
        console.error("Error adding note:", err);
        alert("Υπήρξε σφάλμα κατά την προσθήκη της σημείωσης.");
    }
}

async function checkRole(thesisId) {
    try {
        const response = await fetch(`/prof/check-professor-role/${thesisId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data.role;
    } catch (err) {
        console.error("Error finding professor role:", err);
        alert("Υπήρξε σφάλμα.");
    }
}

// === Utility Functions ===
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

function getStatusBadge(status) {
    const badgeMap = {
        accepted: '<span class="badge bg-success">Αποδεκτή</span>',
        pending: '<span class="badge bg-warning">Εκκρεμεί</span>',
        rejected: '<span class="badge bg-danger">Απορριφθείσα</span>'
    };
    return badgeMap[status] || `<span class="badge bg-secondary">${status}</span>`;
}

