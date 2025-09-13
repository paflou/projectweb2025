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

async function showConfirm(message) {
    const confirmModalEl = document.getElementById('confirmModal');
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmModalConfirmBtn');
    const cancelBtn = document.getElementById('confirmModalCancelBtn');

    modalBody.innerHTML = message;

    const confirmModal = new bootstrap.Modal(confirmModalEl);

    return new Promise((resolve) => {
        // Clean previous event listeners
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));

        const newConfirmBtn = document.getElementById('confirmModalConfirmBtn');
        const newCancelBtn = document.getElementById('confirmModalCancelBtn');

        function dimOtherModals() {
            document.querySelectorAll('.modal.show').forEach(modal => {
                if (modal !== confirmModalEl) modal.classList.add('dimmed');
            });
        }

        function undimOtherModals() {
            document.querySelectorAll('.modal.dimmed').forEach(modal => {
                modal.classList.remove('dimmed');
            });
        }

        confirmModalEl.addEventListener('show.bs.modal', dimOtherModals);
        confirmModalEl.addEventListener('hidden.bs.modal', undimOtherModals);

        // Confirm resolves true
        newConfirmBtn.addEventListener('click', () => {
            resolve(true);
            confirmModal.hide();
        });

        // Cancel resolves false
        newCancelBtn.addEventListener('click', () => {
            resolve(false);
            confirmModal.hide();
        });

        confirmModal.show();
    });
}

