// Get references to form input elements by their IDs
const email = document.getElementById("contactEmail");
const mobile = document.getElementById("mobilePhone");
const landline = document.getElementById("landlinePhone");
const street = document.getElementById("addressStreet");
const streetNumber = document.getElementById("streetNumber");
const city = document.getElementById("addressCity");
const postcode = document.getElementById("addressZip");

const password = document.getElementById("password");
const submitButton = document.getElementById("submitButton");
const statusText = document.getElementById('statusText');
const form = document.getElementById('informationForm');

// ===============================
// 1. LIVE INPUT FILTERS
// ===============================

// Email – allow only valid email characters
email.addEventListener('input', () => {
    email.value = email.value.replace(/[^a-zA-Z0-9@._\-]/g, '');
});

// Mobile – must start with 69 and max length 10
mobile.addEventListener('input', () => {
    mobile.value = mobile.value.replace(/[^0-9]/g, ''); // only digits
    if (!mobile.value.startsWith('69')) mobile.value = '69';
    if (mobile.value.length > 10) mobile.value = mobile.value.slice(0, 10);
});

// Landline – must start with 2 and max length 10
landline.addEventListener('input', () => {
    landline.value = landline.value.replace(/[^0-9]/g, '');
    if (!landline.value.startsWith('2')) landline.value = '2';
    if (landline.value.length > 10) landline.value = landline.value.slice(0, 10);
});

// Street – allow only Greek/English letters, spaces, and common symbols
street.addEventListener('input', () => {
    street.value = street.value.replace(/[^a-zA-ZΑ-Ωα-ωΆ-Ώά-ώ\s]/g, '');
});

// Street number – allow only numbers, range 1-9999
streetNumber.addEventListener('input', () => {
    streetNumber.value = streetNumber.value.replace(/[^0-9]/g, '');
    if (parseInt(streetNumber.value) > 9999) streetNumber.value = '9999';
});

// City – only Greek/English letters and spaces
city.addEventListener('input', () => {
    city.value = city.value.replace(/[^a-zA-ZΑ-Ωα-ωΆ-Ώά-ώ\s]/g, '');
});

// Postcode – only numbers, exactly 5 digits
postcode.addEventListener('input', () => {
    postcode.value = postcode.value.replace(/[^0-9]/g, '');
    if (postcode.value.length > 5) postcode.value = postcode.value.slice(0, 5);
});

// ===============================
// 2. Populate the form fields when the page loads
// ===============================
document.addEventListener('DOMContentLoaded', populateForm);

password.addEventListener('input', enableSaveButton);

async function populateForm() {
    const response = await fetch('/student/get-info', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    const info = data.info;

    if (email) email.value = info.email || '';
    if (mobile) mobile.value = info.mobile || '';
    if (landline) landline.value = info.landline || '';
    if (street) street.value = info.street || '';
    if (streetNumber) streetNumber.value = info.street_number || '';
    if (city) city.value = info.city || '';
    if (postcode) postcode.value = info.postcode || '';

    enableSaveButton();
}

// ===============================
// 3. Enable/disable the save button based on password
// ===============================
function enableSaveButton() {
    if (password.value.trim() !== "") {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

// ===============================
// 4. Handle form submission
// ===============================
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const response = await fetch('/student/put-info', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: getNewDataJson()
    });

    if (response.ok) {
        showSuccess('Η καταχώρηση σας ήταν επιτυχής.');
        setTimeout(() => {
            window.location.reload();
        }, 1500); // 1.5 seconds
        
    } else if (response.status === 401) {
        showError('Η ταυτοποίηση απέτυχε, δοκιμάστε ξανά.');
    } else {
        showError('Προέκυψε σφάλμα. Δοκιμάστε ξανά.');
    }
});


function getNewDataJson() {
    return JSON.stringify({
        email: email.value.trim(),
        mobile: mobile.value.trim(),
        landline: landline.value.trim(),
        street: street.value.trim(),
        streetNumber: streetNumber.value.trim(),
        city: city.value.trim(),
        postcode: postcode.value.trim(),
        password: password.value.trim()
    });
}
