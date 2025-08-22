function showError(message) {
    const errorModalEl = document.getElementById('errorModal');
    const modalBody = document.getElementById('errorModalBody');
    modalBody.innerHTML = message;

    // Remove previous event listeners if any
    errorModalEl.removeEventListener('show.bs.modal', dimOtherModals);
    errorModalEl.removeEventListener('hidden.bs.modal', undimOtherModals);

    function dimOtherModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            if (modal !== errorModalEl) {
                modal.classList.add('dimmed');
            }
        });
    }

    function undimOtherModals() {
        document.querySelectorAll('.modal.dimmed').forEach(modal => {
            modal.classList.remove('dimmed');
        });
    }

    errorModalEl.addEventListener('show.bs.modal', dimOtherModals);
    errorModalEl.addEventListener('hidden.bs.modal', undimOtherModals);

    const errorModal = new bootstrap.Modal(errorModalEl);
    errorModal.show();
}

function showSuccess(message) {
    const successModalEl = document.getElementById('successModal');
    const modalBody = document.getElementById('successModalBody');
    modalBody.innerHTML = message;

    // Remove previous event listeners if any
    successModalEl.removeEventListener('show.bs.modal', dimOtherModals);
    successModalEl.removeEventListener('hidden.bs.modal', undimOtherModals);

    function dimOtherModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            if (modal !== successModalEl) {
                modal.classList.add('dimmed');
            }
        });
    }

    function undimOtherModals() {
        document.querySelectorAll('.modal.dimmed').forEach(modal => {
            modal.classList.remove('dimmed');
        });
    }

    successModalEl.addEventListener('show.bs.modal', dimOtherModals);
    successModalEl.addEventListener('hidden.bs.modal', undimOtherModals);

    const successModal = new bootstrap.Modal(successModalEl);
    successModal.show();
}