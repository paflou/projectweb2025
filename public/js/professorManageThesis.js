// =======================
// 1. Constants & DOM Elements
// =======================

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
const activeThesisSection = document.getElementById('activeThesisSection');
const underReviewSection = document.getElementById('underReviewSection');
const announcementSection = document.getElementById('announcementSection');

const cancelAssignmentBtn = document.getElementById('cancelAssignmentBtn');
const addNoteBtn = document.getElementById('addNoteBtn');
const markAsUnderReviewBtn = document.getElementById('markAsUnderReviewBtn');
const cancelAfter2YearsBtn = document.getElementById('cancelAfter2YearsBtn');
const viewDraftBtn = document.getElementById('viewDraftBtn');


const notesList = document.getElementById('notesList');
const newNoteInput = document.getElementById('newNoteInput');
const supervisorActionsActive = document.getElementById('supervisorActionsActive');
const cancelAfter2YearsDesc = document.getElementById('cancelAfter2YearsDesc');
const markAsUnderReviewDesc = document.getElementById('markAsUnderReviewDesc');

const gradingSection = document.getElementById('gradingSection');
const gradesTable = document.getElementById('gradesTable');


const cancelAssignmentModal = document.getElementById('cancelAssignmentModal');
const assemblyYearField = document.getElementById('assemblyYear');
const assemblyNumberField = document.getElementById('assemblyNumber');


const openGradeModalBtn = document.getElementById('openGradeModalBtn');
const gradeModalEl = document.getElementById('gradeModal');
const gradeModal = new bootstrap.Modal(gradeModalEl);

const thesisId = window.location.pathname.split('/').pop();

// 2. Utility Functions
// =======================
// =======================

function calculateTotal(grade) {
    let totalGrade = 0;

    if (!isNaN(grade.criterion1)) {
        totalGrade += grade.criterion1 * 0.6;
    }
    if (!isNaN(grade.criterion2)) {
        totalGrade += grade.criterion2 * 0.15;
    }
    if (!isNaN(grade.criterion3)) {
        totalGrade += grade.criterion3 * 0.15;
    }
    if (!isNaN(grade.criterion4)) {
        totalGrade += grade.criterion4 * 0.1;
    }

    return totalGrade;
}

// 3. Data/API Functions
// =======================
// =======================

async function fetchThesisData() {
    const response = await fetch(`/prof/api/get-specific-thesis/${thesisId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.thesis || null;
}

async function fetchInvitations() {
    const response = await fetch(`/prof/api/get-thesis-invitations/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function fetchNotes() {
    const response = await fetch(`/prof/api/get-notes/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function fetchAssignmentDate() {
    const response = await fetch(`/prof/api/get-assignment-date/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function checkPresentation() {
    const response = await fetch(`/prof/api/get-presentation-date/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function createPresentationAnnouncement(text) {
    const response = await fetch(`/prof/api/create-presentation-announcement/${thesisId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error('Failed to create announcement');
    return await response.json();
}

async function checkAnnouncement() {
    const response = await fetch(`/prof/api/get-presentation-announcement/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function checkGrading() {
    const response = await fetch(`/prof/api/get-grading-status/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function enableGrading() {
    const response = await fetch(`/prof/api/enable-grading/${thesisId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Failed to create announcement');
    return await response.json();
}

async function getGrades() {
    const response = await fetch(`/prof/api/get-grades/${thesisId}`);
    if (!response.ok) return [];
    return await response.json();
}

async function saveGrade(data) {
    const response = await fetch(`/prof/api/save-grade/${thesisId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
    });
    if (!response.ok) throw new Error('Failed to create announcement');
    return await response.json();
}

async function cancelAssignment(id) {
    const response = await fetch(`/prof/api/cancel-under-assignment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
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

async function checkRole(thesisId) {
    try {
        const response = await fetch(`/prof/api/check-professor-role/${thesisId}`, {
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

async function deleteNote(noteId) {
    if (!(await showConfirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη σημείωση;'))) return;

    try {
        const response = await fetch('/prof/api/delete-thesis-note', {
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
        const response = await fetch('/prof/api/edit-thesis-note', {
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
    console.log(noteText)
    if (!noteText) return;

    if (noteText.length > 300) {
        alert("Η σημείωση δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.");
        return;
    }

    try {
        const response = await fetch(`/prof/api/add-thesis-note`, {
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

// 4. DOM Rendering / UI Setup
// =======================
// =======================

function hideLoading() {
    loadingState.classList.add('d-none');
    thesisManagementCard.classList.remove('d-none');
}

async function renderSections(thesis) {
    // Get professor role
    const role = await checkRole(thesisId);

    // Show section depending on status
    switch (thesis.status) {
        case 'under-assignment':
            setUpCancelAssignmentBtnForUnderAssignment();
            pendingAssignmentSection.classList.remove('d-none');
            populateInvitationTable();
            break;
        case 'active':
            activeThesisSection.classList.remove('d-none');
            setUpAddNoteBtn();
            populateNoteField();
            if (role === 'supervisor')
                setUpSupervisorActionsForActiveThesis(thesis);
            break;
        case 'under-review':
            setUpUnderReview();
            const gradingEnabled = await checkGrading();
            const presentation = await checkPresentation();
            const now = new Date();

            if (role === 'supervisor') {
                setUpAnnouncementSection();
                //REMOVE THE DATE FOR THE PRESENTATION FOR THE WALKTHROUGH
                if (gradingEnabled.status === false) setUpGradingSection();
            }
            else {
                const gradingNotEnabledNotice = document.getElementById('gradingNotEnabledNotice');
                if (gradingEnabled.status === false) gradingNotEnabledNotice.classList.remove('d-none')
            }

            console.log(gradingEnabled.status)
            if (gradingEnabled.status === true) {
                setUpOpenGradeModalBtn();
                setUpGradeModal();
                populateGradesTable();
                gradingSection.classList.remove('d-none');
            }
            break;
        case 'completed':
            const underReviewTitle = document.getElementById('underReviewTitle');

            populateGradesTable();
            openGradeModalBtn.classList.add('d-none');
            underReviewTitle.textContent = "Περατωμένη";
            underReviewSection.classList.remove('d-none');
            gradingSection.classList.remove('d-none');
            break;
    }
    setUpGeneralModals();
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
    thesisStatusBadge.innerHTML = getThesisBadge(thesis.status);
}

function setUpGeneralModals() {
    const successModalEl = document.getElementById('successModal');
    const errorModalEl = document.getElementById('errorModal');

    successModalEl.addEventListener('hidden.bs.modal', () => {
        location.reload(); // refresh the page when modal is fully hidden
    });

    errorModalEl.addEventListener('hidden.bs.modal', () => {
        location.reload(); // refresh the page when modal is fully hidden
    });
}

function setUpGradeModal() {
    const gradeInputs = document.querySelectorAll('.grade-input');
    const totalGradeField = document.getElementById('totalGrade');
    const saveGradeBtn = document.getElementById('saveGradeBtn');

    // Weight percentages
    const weights = [0.60, 0.15, 0.15, 0.10];
    console.log(gradeInputs)
    // Add input listener to enforce format and calculate total
    gradeInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value;

            // Allow only digits and one decimal point
            value = value.replace(/[^0-9.]/g, '');

            const parts = value.split('.');

            // Only allow one decimal point
            if (parts.length > 2) value = parts[0] + '.' + parts[1];

            // Limit integer part to 2 digits
            if (parts[0].length > 2) {
                parts[0] = parts[0].slice(0, 2);
                value = parts.join('.');
            }

            // Limit decimal part to 2 digits
            if (parts[1]?.length > 2) {
                parts[1] = parts[1].slice(0, 2);
                value = parts.join('.');
            }

            // Ensure max is 10.00
            if (parseFloat(value) > 10) {
                // If user tries to type above 10, revert to the previous valid value
                value = e.target.getAttribute('data-last-valid') || '';
            }

            // Save current value as "last valid" for later reference
            e.target.setAttribute('data-last-valid', value);

            e.target.value = value;

            let total = 0;

            gradeInputs.forEach((input, index) => {
                total += parseFloat(input.value) * weights[index];
            });

            totalGradeField.value = total.toFixed(2);
        });
    });

    saveGradeBtn.addEventListener('click', async () => {
        const confirmSaveGrade = await showConfirm(
            "Προσοχή! Η βαθμολογία για αυτή τη διπλωματική θα καταχωρηθεί ΟΡΙΣΤΙΚΑ. " +
            "Μετά την αποθήκευση, δεν θα μπορείτε να την αλλάξετε. Είστε σίγουροι ότι θέλετε να συνεχίσετε;"
        );

        if (!confirmSaveGrade) return;

        const data = {
            criterion1: parseFloat(document.getElementById('criterion1').value),
            criterion2: parseFloat(document.getElementById('criterion2').value),
            criterion3: parseFloat(document.getElementById('criterion3').value),
            criterion4: parseFloat(document.getElementById('criterion4').value),
        };

        const response = await saveGrade(data);
        try {
            showSuccess("Η βαθμολογία καταχωρήθηκε επιτυχώς");
        } catch (err) {
            showError(err.message);
        }
    });
}

async function setUpGradingSection() {
    const enableGradingSectionBtn = document.getElementById('enableGradingSectionBtn');
    const gradingSection = document.getElementById('gradingSection');
    enableGradingSectionBtn.classList.remove('d-none');

    enableGradingSectionBtn.addEventListener('click', async () => {
        const confirmEnable = await showConfirm(
            "Είστε σίγουροι ότι θέλετε να ενεργοποιήσετε τη βαθμολόγηση; " +
            "Αφού ενεργοποιηθεί, οι καθηγητές θα μπορούν να καταχωρήσουν βαθμούς."
        );
        if (!confirmEnable) return;

        try {
            const response = await fetch(`/prof/api/enable-grading/${thesisId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(data.message);
                enableGradingSectionBtn.disabled = true;
                gradingSection.classList.remove('d-none');
            } else {
                showError(data.error);
            }
        } catch (err) {
            showError(err.message);
        }
    });
}

async function populateGradesTable(thesisId) {
    let grades = await getGrades(thesisId);
    if (grades.message === 'hasGraded')
        openGradeModalBtn.disabled = true;

    //console.log(grades)
    grades = grades.grades
    const gradesTable = document.getElementById('gradesTable');
    gradesTable.innerHTML = ''; // clear previous rows

    if (!grades || grades.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center text-muted">Δεν υπάρχουν βαθμολογίες</td>`;
        gradesTable.appendChild(tr);
        return;
    }

    grades.forEach(grade => {
        const tr = document.createElement('tr');
        const professor_name = grade.professor_name + " " + grade.professor_surname;

        tr.innerHTML = `
        <td>${professor_name}</td>
        <td>${grade.criterion1 !== null ? grade.criterion1 : '-'}</td>
        <td>${grade.criterion2 !== null ? grade.criterion2 : '-'}</td>
        <td>${grade.criterion3 !== null ? grade.criterion3 : '-'}</td>
        <td>${grade.criterion4 !== null ? grade.criterion4 : '-'}</td>
        <td class="text-center fw-bold">${calculateTotal(grade)}</td>
        `;

        gradesTable.appendChild(tr);
    });
}

async function setUpAnnouncementSection() {
    const generateAnnouncementBtn = document.getElementById('generateAnnouncementBtn');
    const announcementText = document.getElementById('announcementText');
    const announcementWarning = document.getElementById('announcementWarning');
    announcementText.value = '';
    announcementSection.classList.remove('d-none');

    const date = await checkPresentation();
    console.log(date);

    // Exit early if presentation data is incomplete
    if (!date || date.exam_datetime === null || date.exam_mode === null || date.exam_location === null) {
        announcementText.placeholder = 'Το πεδίο αυτό θα ενεργοποιηθεί αφότου ο φοιτητής ορίσει ημερομηνία εξέτασης.';

        return;
    }

    announcementText.placeholder = 'Γράψτε εδώ το μήνυμα της ανακοίνωσης και έπειτα πατήστε το κουμπί δημιοσίευσης.';

    // Fetch existing announcement
    const announcement = await checkAnnouncement();
    //console.log(announcement);

    if (announcement.announcement_text) {
        // Pre-fill textarea
        announcementText.value = announcement.announcement_text;

        
        // Show warning about overwrite    
        announcementWarning.textContent =
            "Προσοχή: " +
            "Το κείμενο που βλέπετε παραπάνω είναι το τρέχον κείμενο της ανακοίνωσης. " +
            "Αν αποθηκεύσετε, η παλιά ανακοίνωση θα αντικατασταθεί.";

        generateAnnouncementBtn.textContent = `Επεξεργασία Ανακοίνωσης`;
        generateAnnouncementBtn.classList.add("btn-outline-primary");

        generateAnnouncementBtn.classList.remove("btn-outline-success");

        announcementWarning.classList.remove('d-none'); // show it
    } else {
        announcementWarning.classList.add('d-none'); // hide it if no announcement exists
    }

    // Enable the button
    generateAnnouncementBtn.classList.remove('disabled');
    announcementText.disabled = false;

    // Add event listener
    generateAnnouncementBtn.addEventListener('click', async () => {
        try {
            console.log(announcementText.value);
            await createPresentationAnnouncement(announcementText.value);
            showSuccess("Η ανακοίνωση δημιουργήθηκε επιτυχώς");
        } catch (err) {
            showError(err.message);
        }
    });
}

function setUpUnderReview() {
    const viewDraftBtn = document.getElementById('viewDraftBtn');

    viewDraftBtn.addEventListener('click', () => {
        window.location.href = `/prof/api/download-thesis/${thesisId}`;
    });
    underReviewSection.classList.remove('d-none');
}

async function setUpSupervisorActionsForActiveThesis(thesis) {
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

            const res = await fetch(`/prof/api/cancel-active-assignment/${thesisId}`, {
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

    markAsUnderReviewBtn.disabled = true; // disable initially
    
    console.log(thesis.draft, thesis.ap_number)

    // Enable button only if draft exists and ap number is set
    if(thesis.draft && thesis.ap_number) {
        markAsUnderReviewBtn.disabled = false;
        markAsUnderReviewDesc.classList.add('d-none');
    }
    else if(!thesis.draft) {
        markAsUnderReviewBtn.disabled = true;
        markAsUnderReviewDesc.textContent = 'Ο φοιτητής πρώτα να ανεβάσει το προσχέδιο.';
    }
    else if(!thesis.ap_number) {
        markAsUnderReviewBtn.disabled = true;
        markAsUnderReviewDesc.textContent = 'Η γραμματεία πρέπει πρώτα να ορίσει αριθμό μητρώου.';
    }

    // 4. Mark as under review button
    markAsUnderReviewBtn.addEventListener('click', async () => {
        if (!(await showConfirm("Μεταφορά σε Υπό Εξέταση;"))) return;
        try {
            const res = await fetch(`/prof/api/mark-under-review/${thesisId}`, {
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
}

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


// 5. Button Event Listeners
// =======================
// =======================

function setUpCancelAssignmentBtnForUnderAssignment() {
    cancelAssignmentBtn.addEventListener('click', async () => {
        const confirmCancel = await showConfirm("Είστε σίγουροι ότι θέλετε να ακυρώσετε την ανάθεση;");
        if (!confirmCancel) return;

        try {
            await cancelAssignment(thesis.id);
            document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
                window.location.href = '/prof/api/view_thesis';
            }, { once: true });
        } catch (err) {
            console.error("Error in cancellation:", err);
            alert("Υπήρξε σφάλμα κατά την ακύρωση της ανάθεσης.");
        }
    });
}

function setUpOpenGradeModalBtn() {
    openGradeModalBtn.addEventListener('click', () => {
        gradeModal.show();
        document.getElementById('gradeForm').reset();
        document.getElementById('totalGrade').value = '';
    });
}

function setUpAddNoteBtn() {
    addNoteBtn.addEventListener('click', addNewNote);

    newNoteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewNote();
        }
    });
}

// === Page Initialization ===
document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
});

async function initializePage() {
    try {
        const thesis = await fetchThesisData();
        if (!thesis) return showNoThesisState();

        hideLoading();
        renderThesisDetails(thesis);
        renderSections(thesis);
    } catch (err) {
        console.error('Error initializing page:', err);
        showNoThesisState();
    }
}