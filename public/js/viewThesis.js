// View Thesis JavaScript functionality
document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const loadingState = document.getElementById('loadingState');
    const noThesisState = document.getElementById('noThesisState');
    const thesisDetailsCard = document.getElementById('thesisDetailsCard');
    const committeeCard = document.getElementById('committeeCard');
    const statusInfoCard = document.getElementById('statusInfoCard');

    // Thesis details elements
    const thesisTitle = document.getElementById('thesisTitle');
    const thesisDescription = document.getElementById('thesisDescription');
    const thesisStatusBadge = document.getElementById('thesisStatusBadge');
    const supervisorName = document.getElementById('supervisorName');
    const supervisorTopic = document.getElementById('supervisorTopic');
    const supervisorDepartment = document.getElementById('supervisorDepartment');
    const submissionDate = document.getElementById('submissionDate');
    const assignmentInfo = document.getElementById('assignmentInfo');
    const assignmentDate = document.getElementById('assignmentDate');
    const timeElapsed = document.getElementById('timeElapsed');

    // File elements
    const attachedFileSection = document.getElementById('attachedFileSection');
    const attachedFileName = document.getElementById('attachedFileName');
    const downloadFileBtn = document.getElementById('downloadFileBtn');

    // Committee elements
    const committeeNotAssigned = document.getElementById('committeeNotAssigned');
    const committeeMembers = document.getElementById('committeeMembers');

    // Status elements
    const statusDescription = document.getElementById('statusDescription');

    // Load thesis information on page load
    loadThesisDetails();

    // Load detailed thesis information
    async function loadThesisDetails() {
        try {
            const response = await fetch('/student/detailed-thesis-info', {
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
                displayThesisDetails(data.thesis);
            }

        } catch (error) {
            console.error('Error loading thesis details:', error);
            hideLoadingState();
            showError('Σφάλμα κατά τη φόρτωση των στοιχείων της διπλωματικής εργασίας');
        }
    }

    // Display thesis details
    function displayThesisDetails(thesis) {
        // Show main card
        thesisDetailsCard.classList.remove('d-none');

        // Set basic thesis information
        thesisTitle.textContent = thesis.title;
        thesisDescription.textContent = thesis.description;

        // Set status badge
        thesisStatusBadge.innerHTML = getThesisBadge(thesis.thesis_status);
        
        // Set supervisor information
        supervisorName.textContent = `${thesis.supervisor_name} ${thesis.supervisor_surname}`;
        supervisorTopic.textContent = thesis.supervisor_topic || 'Δεν έχει καθοριστεί θέμα';
        supervisorDepartment.textContent = thesis.supervisor_department || 'Δεν έχει καθοριστεί τμήμα';

        // Set submission date
        const submissionDateObj = new Date(thesis.submission_date);
        submissionDate.textContent = formatDate(submissionDateObj);

        // Set assignment information if available
        if (thesis.assignment_date && thesis.time_elapsed_days) {
            assignmentInfo.classList.remove('d-none');
            const assignmentDateObj = new Date(thesis.assignment_date);
            assignmentDate.textContent = formatDate(assignmentDateObj);
            timeElapsed.textContent = `${thesis.time_elapsed_days} ημέρες`;
        }

        // Handle attached file
        if (thesis.pdf) {
            attachedFileSection.classList.remove('d-none');
            attachedFileName.textContent = thesis.pdf;
            downloadFileBtn.onclick = () => downloadFile(thesis.pdf);
        }

        // Display committee information
        displayCommitteeInfo(thesis);

        // Display status information
        displayStatusInfo(thesis);
    }

    // Display committee information
    function displayCommitteeInfo(thesis) {
        committeeCard.classList.remove('d-none');

        if (!thesis.committee_members || thesis.committee_members.length === 0) {
            committeeNotAssigned.classList.remove('d-none');
            committeeMembers.innerHTML = '';
        } else {
            committeeNotAssigned.classList.add('d-none');

            // Clear existing members
            committeeMembers.innerHTML = '';

            // Add supervisor as first member
            const supervisorCard = createCommitteeMemberCard(
                `${thesis.supervisor_name} ${thesis.supervisor_surname}`,
                thesis.supervisor_topic,
                thesis.supervisor_department,
                'Επιβλέπων Καθηγητής',
                'primary'
            );
            committeeMembers.appendChild(supervisorCard);

            // Add committee members
            thesis.committee_members.forEach((member, index) => {
                const memberCard = createCommitteeMemberCard(
                    `${member.name} ${member.surname}`,
                    member.topic,
                    member.department,
                    `${index + 2}ο Μέλος`,
                    'success'
                );
                committeeMembers.appendChild(memberCard);
            });
        }
    }

    // Create committee member card
    function createCommitteeMemberCard(name, topic, department, role, badgeColor) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';

        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${name}</h6>
                        <span class="badge bg-${badgeColor}">${role}</span>
                    </div>
                    <p class="card-text small text-muted mb-1">
                        <strong>Θέμα:</strong> ${topic || 'Δεν έχει καθοριστεί'}
                    </p>
                    <p class="card-text small text-muted mb-0">
                        <strong>Τμήμα:</strong> ${department || 'Δεν έχει καθοριστεί'}
                    </p>
                </div>
            </div>
        `;

        return col;
    }

    // Display status-specific information
    function displayStatusInfo(thesis) {
        statusInfoCard.classList.remove('d-none');

        let statusHtml = '';

        switch (thesis.thesis_status) {
            case 'under-assignment':
                statusHtml = `
                    <div class="alert alert-warning">
                        <i class="bi bi-clock me-2"></i>
                        <strong>Υπό Ανάθεση:</strong> Η διπλωματική εργασία αναμένει την επιλογή και αποδοχή της τριμελούς επιτροπής.
                        Χρειάζονται δύο επιπλέον καθηγητές για να ολοκληρωθεί η επιτροπή.
                    </div>
                    <p class="mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Μπορείτε να διαχειριστείτε την επιλογή επιτροπής από τη σελίδα 
                        <a href="/student/manage" class="text-decoration-none">Διαχείριση Διπλωματικής</a>.
                    </p>
                `;
                break;
            case 'active':
                statusHtml = `
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle me-2"></i>
                        <strong>Ενεργή:</strong> Η διπλωματική εργασία είναι ενεργή και μπορείτε να εργάζεστε πάνω της.
                        Η τριμελής επιτροπή έχει οριστεί πλήρως.
                    </div>
                    <p class="mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Μπορείτε να ανεβάσετε το κείμενό σας και να διαχειριστείτε τη διπλωματική από τη σελίδα 
                        <a href="/student/manage" class="text-decoration-none">Διαχείριση Διπλωματικής</a>.
                    </p>
                `;
                break;
            case 'under-review':
                statusHtml = `
                    <div class="alert alert-info">
                        <i class="bi bi-eye me-2"></i>
                        <strong>Υπό Εξέταση:</strong> Η διπλωματική εργασία βρίσκεται υπό εξέταση από την τριμελή επιτροπή.
                    </div>
                    <p class="mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Αναμένετε την ολοκλήρωση της εξέτασης και την ανακοίνωση των αποτελεσμάτων.
                    </p>
                `;
                break;
            case 'completed':
                statusHtml = `
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle me-2"></i>
                        <strong>Ολοκληρωμένη:</strong> Η διπλωματική εργασία έχει ολοκληρωθεί επιτυχώς.
                        ${thesis.grade ? `Τελικός βαθμός: <strong>${thesis.grade}/10</strong>` : ''}
                    </div>
                    <p class="mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Μπορείτε να δείτε την αναφορά εξέτασης και τα στοιχεία της διπλωματικής από τη σελίδα
                        <a href="/student/manage" class="text-decoration-none">Διαχείριση Διπλωματικής</a>.
                    </p>
                `;
                break;
            default:
                statusHtml = `
                    <div class="alert alert-secondary">
                        <i class="bi bi-question-circle me-2"></i>
                        <strong>Άγνωστη κατάσταση:</strong> Επικοινωνήστε με τη γραμματεία για περισσότερες πληροφορίες.
                    </div>
                `;
        }

        statusDescription.innerHTML = statusHtml;
    }

    // Utility functions
    function hideLoadingState() {
        loadingState.classList.add('d-none');
    }

    function showNoThesisState() {
        noThesisState.classList.remove('d-none');
    }

    function formatDate(date) {
        return date.toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function downloadFile(filename) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = `/uploads/theses_descriptions/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showError(message) {
        if (typeof showErrorModal === 'function') {
            showErrorModal('Σφάλμα', message);
        } else {
            alert(message);
        }
    }
});
