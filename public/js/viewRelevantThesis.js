// DOM Elements
const statusFilter = document.getElementById('statusFilter');
const roleFilter = document.getElementById('roleFilter');
const thesisTableBody = document.getElementById('thesisTableBody');
const thesisContainer = document.getElementById('thesisContainer');
const noThesisMessage = document.getElementById('noThesisMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

const exportCSVBtn = document.getElementById('exportCSV');
const exportJSONBtn = document.getElementById('exportJSON');

// Details modal elements
const thesisDetailsModal = new bootstrap.Modal(document.getElementById('thesisDetailsModal'));
const detailTitle = document.getElementById('detailTitle');
const detailStudent = document.getElementById('detailStudent');
const detailSupervisor = document.getElementById('detailSupervisor');
const detailCommittee = document.getElementById('detailCommittee');
const detailStatus = document.getElementById('detailStatus');
const detailTimeline = document.getElementById('detailTimeline');
const detailFinalGrade = document.getElementById('detailFinalGrade');
const detailRepositoryLink = document.getElementById('detailRepositoryLink');
const thesisReportLink = document.getElementById('thesisReportLink');
const actionBtn = document.getElementById('actionBtn');
const completeThesisInfo = document.getElementById('completeThesisInfo');

// State variables
let allThesis = [];
let filteredThesis = [];
let selectedThesis = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeEventListeners();
    await loadThesis();
});

// Event listeners
function initializeEventListeners() {
    statusFilter.addEventListener('change', applyFilters);
    roleFilter.addEventListener('change', applyFilters);

    exportCSVBtn.addEventListener('click', () => exportData('csv'));
    exportJSONBtn.addEventListener('click', () => exportData('json'));
}

// Load thesis from server
async function loadThesis() {
    showLoading();
    try {
        const response = await fetch('/prof/api/get-relevant-thesis', { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        //console.log('Fetched thesis data:', data);
        allThesis = data || [];
        applyFilters();
    } catch (error) {
        console.error('Error loading thesis:', error);
        showError('Σφάλμα κατά τη φόρτωση των διπλωματικών.');
    } finally {
        hideLoading();
    }
}

// Apply filters
function applyFilters() {
    const status = statusFilter.value;
    //console.log("Selected status filter:", status);
    const role = roleFilter.value;
    //console.log("allThesis:", allThesis);
    filteredThesis = allThesis.info.filter(t => {
        let statusMatch = !status || t.status === status;
        let roleMatch = !role || t.user_role === role;
        return statusMatch && roleMatch;
    });

    displayThesis();
}

// Display thesis in table
function displayThesis() {
    thesisTableBody.innerHTML = '';

    if (!filteredThesis || filteredThesis.length === 0) {
        thesisContainer.classList.add('d-none');
        noThesisMessage.classList.remove('d-none');
        return;
    }

    noThesisMessage.classList.add('d-none');
    thesisContainer.classList.remove('d-none');

    filteredThesis.forEach(thesis => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${escapeHtml(thesis.title)}</td>
            <td>${escapeHtml(thesis.student_name)}</td>
            <td>${escapeHtml(thesis.supervisor_name)}</td>
            <td>${thesis.user_role === 'supervisor' ? 'Επιβλέπων' : 'Μέλος Τριμελούς'}</td>
            <td>${formatStatus(thesis.status)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-primary">Λεπτομέρειες</button>
            </td>
        `;

        const detailsBtn = tr.querySelector('button');
        detailsBtn.addEventListener('click', () => showThesisDetails(thesis));

        thesisTableBody.appendChild(tr);
    });
}

async function getTimelineForThesis(thesisId) {
    try {
        const response = await fetch(`/prof/api/get-thesis-timeline/${thesisId}`, { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.timeline || '-';
    } catch (error) {
        console.error('Error fetching timeline:', error);
        return '-';
    }
}

async function renderTimeline(thesisId) {
    const timeline = await getTimelineForThesis(thesisId);

    const tbody = document.querySelector('#detailTimeline tbody');
    // Clear previous content
    tbody.innerHTML = '';

    if (!Array.isArray(timeline) || timeline.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="3">-</td>';
        tbody.appendChild(tr);
        return;
    }

    timeline.forEach(event => {
        const tr = document.createElement('tr');

        const action = event.action || '-';
        const name = event.name ? event.name.concat(" ", event.surname) : 'Σύστημα';
        const role = event.user_role || '-';
        const date = new Date(event.event_date).toLocaleString() || '-';

        tr.innerHTML = `
            <td>${action}</td>
            <td>${name}</td>
            <td>${role}</td>
            <td>${date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Show thesis details modal
async function showThesisDetails(thesis) {

    selectedThesis = thesis;

    // Basic info
    detailTitle.textContent = thesis.title;
    detailStudent.textContent = thesis.student_name || '-';
    detailSupervisor.textContent = thesis.supervisor_name || '-';

    // Committee members
    const committeeMembers = [];
    if (thesis.member1_name) committeeMembers.push(thesis.member1_name);
    if (thesis.member2_name) committeeMembers.push(thesis.member2_name);
    detailCommittee.textContent = committeeMembers.join(', ') || '-';

    // Status
    detailStatus.textContent = formatStatus(thesis.status);


    await renderTimeline(thesis.id);

    console.log(thesis)
    if (thesis.status === 'completed') {
        // Final grade
        detailFinalGrade.textContent = thesis.grade !== null ? thesis.grade : '-';

        // Repository and evaluation form links placeholders


        detailRepositoryLink.href = thesis.final_repository_link;
        thesisReportLink.href = `/thesis/report/${thesis.id}`;

        completeThesisInfo.classList.remove('d-none');
    }
    else {
        completeThesisInfo.classList.add('d-none');
    }
    // Action button navigates to management page
    actionBtn.textContent = 'Διαχείριση Διπλωματικής';
    actionBtn.onclick = () => goToThesisManagementPage(thesis);

    // Show modal
    thesisDetailsModal.show();
}

async function goToThesisManagementPage(thesis) {
    if (!thesis || !thesis.id) {
        alert('Σφάλμα: Μη έγκυρη διπλωματική εργασία.');
        return;
    }

    // Redirect to management page
    window.location.href = `/prof/manage/${thesis.id}`;
}

// Export data
function exportData(format) {
    let data = filteredThesis.map(t => ({
        title: t.title,
        student: t.student_name,
        supervisor: t.supervisor_name,
        role: t.user_role,
        status: t.status,
        final_grade: t.final_grade
    }));

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'thesis.json');
    } else {
        // CSV
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, 'thesis.csv');
    }
}

// Convert array of objects to CSV
function convertToCSV(arr) {
    const headers = Object.keys(arr[0] || {}).join(',');
    const rows = arr.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    return [headers, ...rows].join('\n');
}

// Download a blob
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Utility functions
function showLoading() {
    loadingIndicator.classList.remove('d-none');
}

function hideLoading() {
    loadingIndicator.classList.add('d-none');
}

function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('d-none');
}

function hideError() {
    errorMessage.classList.add('d-none');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatStatus(status) {
    switch (status) {
        case 'under-assignment': return 'Υπό Ανάθεση';
        case 'under-review': return 'Υπό Αξιολόγηση';
        case 'active': return 'Ενεργή';
        case 'completed': return 'Περατωμένη';
        case 'canceled': return 'Ακυρωμένη';
        default: return status;
    }
}
