// Global variables to store current invitation data
let currentInvitationId = null;
let currentThesisTitle = '';

// DOM elements
const loadingIndicator = document.getElementById('loadingIndicator');
const noInvitationsMessage = document.getElementById('noInvitationsMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const invitationsContainer = document.getElementById('invitationsContainer');
const invitationsTableBody = document.getElementById('invitationsTableBody');

// Modal elements
const acceptModal = new bootstrap.Modal(document.getElementById('acceptModal'));
const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
const leaveModal = new bootstrap.Modal(document.getElementById('leaveModal'));
const acceptThesisTitle = document.getElementById('acceptThesisTitle');
const rejectThesisTitle = document.getElementById('rejectThesisTitle');
const confirmAcceptBtn = document.getElementById('confirmAcceptBtn');
const confirmRejectBtn = document.getElementById('confirmRejectBtn');
const confirmLeaveBtn = document.getElementById('confirmLeaveBtn');

// Toast elements
const responseToast = new bootstrap.Toast(document.getElementById('responseToast'));
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadInvitations();
    setupEventListeners();
});

// Set up event listeners for modal buttons
function setupEventListeners() {
    confirmAcceptBtn.addEventListener('click', handleAcceptInvitation);
    confirmRejectBtn.addEventListener('click', handleRejectInvitation);
    confirmLeaveBtn.addEventListener('click', handleLeavecomittee);
}

// Load invitations from the server
async function loadInvitations() {
    try {
        showLoading();

        const response = await fetch('/prof/get-invitations');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.invitations && data.invitations.length > 0) {
            displayInvitations(data.invitations);
        } else {
            showNoInvitations();
        }

    } catch (error) {
        console.error('Error loading invitations:', error);
        showError('Παρουσιάστηκε σφάλμα κατά τη φόρτωση των προσκλήσεων. Παρακαλώ δοκιμάστε ξανά.');
    }
}

// Display invitations in the table
function displayInvitations(invitations) {
    hideAllMessages();
    invitationsContainer.classList.remove('d-none');

    invitationsTableBody.innerHTML = '';

    invitations.forEach(invitation => {
        const row = createInvitationRow(invitation);
        invitationsTableBody.appendChild(row);
    });
}

// Create a table row for an invitation
function createInvitationRow(invitation) {
    const row = document.createElement('tr');

    // Format date
    const invitationDate = new Date(invitation.invitation_date).toLocaleDateString('el-GR');

    // Determine status badge
    const statusBadge = getStatusBadge(invitation.status);

    // Create action buttons based on status
    const actionButtons = createActionButtons(invitation);

    row.innerHTML = `
    <td>
        <div class="fw-bold">${escapeHtml(invitation.thesis_title)}</div>
        <small class="text-muted">${escapeHtml(invitation.thesis_description || '')}</small>
        <div class="d-none thesis-id" id="thesisId">${invitation.thesis_id}</div>
    </td>
    <td>
        <div>${escapeHtml(invitation.supervisor_name)} ${escapeHtml(invitation.supervisor_surname)}</div>
        <small class="text-muted">${escapeHtml(invitation.supervisor_email)}</small>
    </td>
    <td>
        <div>${escapeHtml(invitation.student_name)} ${escapeHtml(invitation.student_surname)}</div>
        <small class="text-muted">ΑΜ: ${escapeHtml(invitation.student_number)}</small>
    </td>
    <td>${invitationDate}</td>
    <td>${statusBadge}</td>
    <td class="text-center">${actionButtons}</td>
`;


    return row;
}

// Get status badge HTML
function getStatusBadge(status) {
    switch (status) {
        case 'pending':
            return '<span class="badge bg-warning text-dark">Εκκρεμεί</span>';
        case 'accepted':
            return '<span class="badge bg-success">Αποδεκτή</span>';
        case 'rejected':
            return '<span class="badge bg-danger">Απορριφθείσα</span>';
        default:
            return '<span class="badge bg-secondary">Άγνωστη</span>';
    }
}

// Create action buttons based on invitation status
function createActionButtons(invitation) {
    if (invitation.status === 'pending') {
        return `
            <button class="btn btn-success btn-sm m-1" onclick="showAcceptModal(${invitation.id}, '${escapeHtml(invitation.thesis_title)}')">
                <i class="bi bi-check-lg"></i> Αποδοχή
            </button>
            <button class="btn btn-danger btn-sm m-1" onclick="showRejectModal(${invitation.id}, '${escapeHtml(invitation.thesis_title)}')">
                <i class="bi bi-x-lg"></i> Απόρριψη
            </button>
        `;
    } else if (invitation.status === 'accepted') {
        return `
            <button class="btn btn-danger btn-sm m-1" onclick="showLeaveModal(${invitation.id}, '${escapeHtml(invitation.thesis_title)}')">
                <i class="bi bi-x-lg"></i> Έξοδος
            </button>
        `;
    }
    return 'Δεν υπάρχουν διαθέσιμες ενέργειες';
}

// Show accept confirmation modal
function showAcceptModal(invitationId, thesisTitle) {
    currentInvitationId = invitationId;
    currentThesisTitle = thesisTitle;
    acceptThesisTitle.textContent = thesisTitle;
    acceptModal.show();
}

// Show reject confirmation modal
function showRejectModal(invitationId, thesisTitle) {
    currentInvitationId = invitationId;
    currentThesisTitle = thesisTitle;
    rejectThesisTitle.textContent = thesisTitle;
    rejectModal.show();
}

// Show leave confirmation modal
function showLeaveModal(invitationId, thesisTitle) {
    currentInvitationId = invitationId;
    currentThesisTitle = thesisTitle;
    rejectThesisTitle.textContent = thesisTitle;
    leaveModal.show();
}

// Handle accept invitation
async function handleAcceptInvitation() {
    try {
        const response = await fetch('/prof/accept-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                invitationId: currentInvitationId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();

        acceptModal.hide();
        showToast('Επιτυχία', 'Η πρόσκληση αποδέχθηκε επιτυχώς!', 'success');

        // Reload invitations to reflect changes
        setTimeout(() => {
            loadInvitations();
        }, 1000);

    } catch (error) {
        console.error('Error accepting invitation:', error);
        acceptModal.hide();
        showToast('Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποδοχή της πρόσκλησης.', 'error');
    }
}

// Handle reject invitation
async function handleRejectInvitation() {
    try {
        const response = await fetch('/prof/reject-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                invitationId: currentInvitationId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();

        rejectModal.hide();
        showToast('Επιτυχία', 'Η πρόσκληση απορρίφθηκε επιτυχώς!', 'success');

        // Reload invitations to reflect changes
        setTimeout(() => {
            loadInvitations();
        }, 1000);

    } catch (error) {
        console.error('Error rejecting invitation:', error);
        rejectModal.hide();
        showToast('Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την απόρριψη της πρόσκλησης.', 'error');
    }
}

// Handle reject invitation
async function handleLeavecomittee() {
    const thesisId = document.getElementById('thesisId').textContent;

    try {
        const response = await fetch('/prof/leave-comittee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                thesisId: thesisId,
                invitationId: currentInvitationId

            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();

        rejectModal.hide();
        showToast('Επιτυχία', 'Η πρόσκληση απορρίφθηκε επιτυχώς!', 'success');

        // Reload invitations to reflect changes
        setTimeout(() => {
            loadInvitations();
        }, 1000);

    } catch (error) {
        console.error('Error rejecting invitation:', error);
        rejectModal.hide();
        showToast('Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την απόρριψη της πρόσκλησης.', 'error');
    }
}

// Show loading indicator
function showLoading() {
    hideAllMessages();
    loadingIndicator.classList.remove('d-none');
}

// Show no invitations message
function showNoInvitations() {
    hideAllMessages();
    noInvitationsMessage.classList.remove('d-none');
}

// Show error message
function showError(message) {
    hideAllMessages();
    errorText.textContent = message;
    errorMessage.classList.remove('d-none');
}

// Hide all status messages
function hideAllMessages() {
    loadingIndicator.classList.add('d-none');
    noInvitationsMessage.classList.add('d-none');
    errorMessage.classList.add('d-none');
    invitationsContainer.classList.add('d-none');
}

// Show toast notification
function showToast(title, message, type) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    const toastElement = document.getElementById('responseToast');
    const toastHeader = toastElement.querySelector('.toast-header');

    // Remove existing type classes
    toastHeader.classList.remove('bg-success', 'bg-danger', 'text-white');

    // Add appropriate styling based on type
    if (type === 'success') {
        toastHeader.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toastHeader.classList.add('bg-danger', 'text-white');
    }

    responseToast.show();
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function (m) { return map[m]; });
}
