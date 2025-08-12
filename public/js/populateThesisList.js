const form = document.getElementById('form');
const duplicateMessage = document.getElementById('duplicate-message');
const newThesisButton = document.getElementById('new-thesis-button');
const publishButton = document.getElementById('publishBtn');
const updateButton = document.getElementById('updateBtn');
const modalTitle = document.getElementById('createThesisModalLabel');
const thesisID = document.getElementById('thesisID');

var info;

// Populate the thesis table when the page loads
document.addEventListener('DOMContentLoaded', populateThesisTable);

// Handle thesis update
updateButton.addEventListener('click', async function (e) {
    e.preventDefault(); // prevent page reload

    // Collect form data (including file)
    const formData = new FormData(form);
    // Send updated data to the server
    const response = await fetch('/prof/update-topic', {
        method: 'POST',
        body: formData // FormData handles multipart/form-data automatically
    });

    if (response.status === 409) {
        duplicateMessage.innerText = 'Υπάρχει ήδη διπλωματική με αυτόν τον τίτλο, δοκιμάστε ξανά.'; // Authentication failed
    }
    else {
        window.location.href = '/prof/create';
    }
});

// Handle thesis upload
newThesisButton.addEventListener('click', () => {
    publishButton.classList.remove('d-none');
    updateButton.classList.add('d-none');
    modalTitle.innerText = "Καταχώρηση νέου θέματος";
    // Clear form inputs
    form.reset();

    // Clear any duplicate error messages
    duplicateMessage.innerText = '';
});


// Handle thesis upload
publishButton.addEventListener('click', async function (e) {
    e.preventDefault(); // prevent page reload

    // Collect form data (including file)
    const formData = new FormData(form);

    // Send updated data to the server
    const response = await fetch('/prof/create-topic', {
        method: 'POST',
        body: formData // FormData handles multipart/form-data automatically
    });

    if (response.status === 409) {
        duplicateMessage.innerText = 'Υπάρχει ήδη διπλωματική με αυτόν τον τίτλο, δοκιμάστε ξανά.'; // Authentication failed
    }
    else {
        window.location.href = '/prof/create';
    }
});

// Fetch professor thesis' under assignment from the server and populate the table
async function populateThesisTable() {
    const response = await fetch('/prof/get-under-assignment', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    info = data.info
    console.log(info)
    console.log(info.length)
    const row = "row";

    for (let i = 0; i < info.length; i++) {
        const newRow = document.createElement('li');
        newRow.id = row.concat(i);
        newRow.textContent = info[i].title;
        newRow.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        document.getElementById('table').appendChild(newRow);

        const newButton = document.createElement('button');
        newButton.textContent = "Επεξεργασία";
        newButton.classList.add("btn", "btn-sm", "btn-secondary");
        newButton.setAttribute('data-bs-toggle', 'modal');
        newButton.setAttribute('data-bs-target', '#thesisModal');

        newButton.addEventListener('click', () => {
            // Populate the form with the thesis data
            form.title.value = info[i].title;
            form.summary.value = info[i].description;
            form.id.value = info[i].id;

            publishButton.classList.add('d-none');
            updateButton.classList.remove('d-none');
            modalTitle.innerText = "Ενημέρωση θέματος";

            const link = document.getElementById('pdfDownload');
            if (info[i].pdf !== "NULL") {
                let uploadPath = '/uploads/' + info[i].pdf;
                link.href = uploadPath;
                link.classList.remove('d-none');
            }
            else {
                link.href = '#';
                link.classList.add('d-none'); // Hide link
            }
            // Clear any duplicate error messages
            duplicateMessage.innerText = '';
        });

        document.getElementById(newRow.id).appendChild(newButton);
    }
}