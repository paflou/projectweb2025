// Statistics page functionality
document.addEventListener('DOMContentLoaded', async () => {
    await loadStatistics();
});

// Chart instances to track and destroy when needed
let supervisedChartInstance = null;
let committeeChartInstance = null;
let totalCountChartInstance = null;
let avgGradeChartInstance = null;
let avgTimeChartInstance = null;

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const statisticsContent = document.getElementById('statisticsContent');

// Supervised statistics elements
const supervisedAvgTime = document.getElementById('supervisedAvgTime');
const supervisedAvgGrade = document.getElementById('supervisedAvgGrade');
const supervisedTotalCount = document.getElementById('supervisedTotalCount');
const supervisedBreakdown = document.getElementById('supervisedBreakdown');

// Committee member statistics elements
const committeeAvgTime = document.getElementById('committeeAvgTime');
const committeeAvgGrade = document.getElementById('committeeAvgGrade');
const committeeTotalCount = document.getElementById('committeeTotalCount');
const committeeBreakdown = document.getElementById('committeeBreakdown');

// Load statistics from API
async function loadStatistics() {
    try {
        // Clean up any existing charts
        destroyAllCharts();

        showLoadingState();
        
        const response = await fetch('/prof/statistics', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.statistics) {
            displayStatistics(data.statistics);
            showStatisticsContent();
        } else {
            throw new Error('No statistics data received');
        }

    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Σφάλμα κατά τη φόρτωση των στατιστικών: ' + error.message);
    }
}

// Display statistics in the UI
function displayStatistics(stats) {
    // Display supervised statistics
    displaySupervisedStats(stats.supervised);
    
    // Display committee member statistics
    displayCommitteeStats(stats.committee_member);
    
    // Display breakdowns
    displayBreakdown(stats.supervised.breakdown, supervisedBreakdown, 'supervised');
    displayBreakdown(stats.committee_member.breakdown, committeeBreakdown, 'committee');

    // Create comparison charts
    createComparisonCharts(stats);
}

// Display supervised statistics
function displaySupervisedStats(supervised) {
    supervisedAvgTime.textContent = supervised.avg_completion_days || 'Δεν υπάρχουν δεδομένα';
    supervisedAvgGrade.textContent = supervised.avg_grade || 'Δεν υπάρχουν δεδομένα';
    supervisedTotalCount.textContent = supervised.total_count || '0';
}

// Display committee member statistics
function displayCommitteeStats(committee) {
    committeeAvgTime.textContent = committee.avg_completion_days || 'Δεν υπάρχουν δεδομένα';
    committeeAvgGrade.textContent = committee.avg_grade || 'Δεν υπάρχουν δεδομένα';
    committeeTotalCount.textContent = committee.total_count || '0';
}

// Display status breakdown
function displayBreakdown(breakdown, container, type) {
    if (!breakdown || breakdown.length === 0) {
        container.innerHTML = '<p class="text-muted">Δεν υπάρχουν δεδομένα</p>';
        return;
    }

    // Create chart
    createChart(breakdown, type);

    // Create text breakdown
    let html = '';
    const statusLabels = {
        'under-assignment': 'Υπό Ανάθεση',
        'active': 'Ενεργές',
        'under-review': 'Υπό Αξιολόγηση',
        'completed': 'Ολοκληρωμένες',
        'canceled': 'Ακυρωμένες'
    };

    const statusColors = {
        'under-assignment': 'warning',
        'active': 'primary',
        'under-review': 'info',
        'completed': 'success',
        'canceled': 'danger'
    };

    breakdown.forEach(item => {
        const label = statusLabels[item.thesis_status] || item.thesis_status;
        const color = statusColors[item.thesis_status] || 'secondary';

        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-${color} me-2">${label}</span>
                <span class="fw-bold">${item.count}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Create pie chart for breakdown
function createChart(breakdown, type) {
    const canvasId = type === 'supervised' ? 'supervisedChart' : 'committeeChart';
    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    // Destroy existing chart if it exists
    if (type === 'supervised' && supervisedChartInstance) {
        supervisedChartInstance.destroy();
    } else if (type === 'committee' && committeeChartInstance) {
        committeeChartInstance.destroy();
    }

    // If no data, don't create chart
    if (!breakdown || breakdown.length === 0) {
        return;
    }

    const statusLabels = {
        'under-assignment': 'Υπό Ανάθεση',
        'active': 'Ενεργές',
        'under-review': 'Υπό Αξιολόγηση',
        'completed': 'Ολοκληρωμένες',
        'canceled': 'Ακυρωμένες'
    };

    const statusChartColors = {
        'under-assignment': '#ffc107',
        'active': '#0d6efd',
        'under-review': '#0dcaf0',
        'completed': '#198754',
        'canceled': '#dc3545'
    };

    const labels = breakdown.map(item => statusLabels[item.thesis_status] || item.thesis_status);
    const data = breakdown.map(item => item.count);
    const colors = breakdown.map(item => statusChartColors[item.thesis_status] || '#6c757d');

    const chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Store chart instance for later destruction
    if (type === 'supervised') {
        supervisedChartInstance = chartInstance;
    } else if (type === 'committee') {
        committeeChartInstance = chartInstance;
    }
}

// Show loading state
function showLoadingState() {
    loadingState.classList.remove('d-none');
    errorState.classList.add('d-none');
    statisticsContent.classList.add('d-none');
}

// Show error state
function showError(message) {
    loadingState.classList.add('d-none');
    statisticsContent.classList.add('d-none');
    errorMessage.textContent = message;
    errorState.classList.remove('d-none');
}

// Show statistics content
function showStatisticsContent() {
    loadingState.classList.add('d-none');
    errorState.classList.add('d-none');
    statisticsContent.classList.remove('d-none');
}

// Utility function to format numbers
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return 'Δεν υπάρχουν δεδομένα';
    return parseFloat(num).toFixed(decimals);
}

// Utility function to format days
function formatDays(days) {
    if (!days) return 'Δεν υπάρχουν δεδομένα';
    return `${days} ημέρες`;
}

// Destroy all existing chart instances
function destroyAllCharts() {
    if (supervisedChartInstance) {
        supervisedChartInstance.destroy();
        supervisedChartInstance = null;
    }
    if (committeeChartInstance) {
        committeeChartInstance.destroy();
        committeeChartInstance = null;
    }
    if (totalCountChartInstance) {
        totalCountChartInstance.destroy();
        totalCountChartInstance = null;
    }
    if (avgGradeChartInstance) {
        avgGradeChartInstance.destroy();
        avgGradeChartInstance = null;
    }
    if (avgTimeChartInstance) {
        avgTimeChartInstance.destroy();
        avgTimeChartInstance = null;
    }
}

// Create three separate comparison charts
function createComparisonCharts(stats) {
    createTotalCountChart(stats);
    createAvgGradeChart(stats);
    createAvgTimeChart(stats);
}

// Create total count comparison chart
function createTotalCountChart(stats) {
    const canvas = document.getElementById('totalCountChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (totalCountChartInstance) {
        totalCountChartInstance.destroy();
    }

    const supervisedCount = stats.supervised.total_count || 0;
    const committeeCount = stats.committee_member.total_count || 0;

    totalCountChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Ως Επιβλέπων', 'Ως Μέλος Επιτροπής'],
            datasets: [{
                data: [supervisedCount, committeeCount],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.8)',
                    'rgba(25, 135, 84, 0.8)'
                ],
                borderColor: [
                    'rgba(13, 110, 253, 1)',
                    'rgba(25, 135, 84, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' διπλωματικές';
                        }
                    }
                }
            }
        }
    });
}

// Create average grade comparison chart
function createAvgGradeChart(stats) {
    const canvas = document.getElementById('avgGradeChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (avgGradeChartInstance) {
        avgGradeChartInstance.destroy();
    }

    const supervisedGrade = parseFloat(stats.supervised.avg_grade) || 0;
    const committeeGrade = parseFloat(stats.committee_member.avg_grade) || 0;

    avgGradeChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Ως Επιβλέπων', 'Ως Μέλος Επιτροπής'],
            datasets: [{
                label: 'Μέσος Βαθμός',
                data: [supervisedGrade, committeeGrade],
                backgroundColor: [
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Μέσος Βαθμός: ' + context.parsed.y.toFixed(2) + '/10';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Βαθμός (0-10)'
                    }
                }
            }
        }
    });
}

// Create average completion time comparison chart
function createAvgTimeChart(stats) {
    const canvas = document.getElementById('avgTimeChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (avgTimeChartInstance) {
        avgTimeChartInstance.destroy();
    }

    const supervisedDays = stats.supervised.avg_completion_days || 0;
    const committeeDays = stats.committee_member.avg_completion_days || 0;

    avgTimeChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Ως Επιβλέπων', 'Ως Μέλος Επιτροπής'],
            datasets: [{
                label: 'Μέσος Χρόνος (ημέρες)',
                data: [supervisedDays, committeeDays],
                backgroundColor: [
                    'rgba(111, 66, 193, 0.8)',
                    'rgba(13, 202, 240, 0.8)'
                ],
                borderColor: [
                    'rgba(111, 66, 193, 1)',
                    'rgba(13, 202, 240, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Μέσος Χρόνος: ' + context.parsed.y + ' ημέρες';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ημέρες'
                    }
                }
            }
        }
    });
}
