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