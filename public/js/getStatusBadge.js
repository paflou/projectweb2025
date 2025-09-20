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

function getThesisBadge(status) {
    console.log("Getting badge for status:", status);
    switch (status) {
        case 'under-assignment':
            return '<span class="badge bg-primary">Υπό Ανάθεση</span>';
        case 'active':
            return '<span class="badge bg-success">Ενεργή</span>';
        case 'under-review':
            return '<span class="badge bg-info">Υπό εξέταση</span>';
        case 'completed':
            return '<span class="badge bg-secondary">Περατωμένη</span>';
        case 'canceled':
            return '<span class="badge bg-danger">Ακυρωμένη</span>';
        default:
            return '<span class="badge bg-dark">Άγνωστη</span>';
    }
}

window.getStatusBadge = getStatusBadge;
window.getThesisBadge = getThesisBadge;