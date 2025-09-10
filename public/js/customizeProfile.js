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
const statusText = document.getElementById('statusText')
const form = document.getElementById('informationForm')

// Populate the form fields when the page loads
document.addEventListener('DOMContentLoaded', populateForm);

// Enable/disable the save button when the password input changes
password.addEventListener('input', enableSaveButton);

// Fetch user info from the server and fill the form fields
async function populateForm() {
    const response = await fetch('/student/get-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    const info = data.info

    // Set form field values if the elements exist
    if (email) email.value = info.email;
    if (mobile) mobile.value = info.mobile;
    if (landline) landline.value = info.landline;
    if (street) street.value = info.street;
    if (streetNumber) streetNumber.value = info.street_number;
    if (city) city.value = info.city;
    if (postcode) postcode.value = info.postcode;

    enableSaveButton();
}

// Enable the submit button only if the password field is not empty
function enableSaveButton() {
    if (password.value.trim() !== "") {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

// Handle form submission
form.addEventListener('submit', async function (e) {
    e.preventDefault(); // prevent page reload

    // Send updated data to the server
    const response = await fetch('/student/put-info', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: getNewDataJson()
    });

    // Show status message based on server response
    if (response.ok) {
        statusText.innerText = 'Η καταχώρηση σας ήταν επιτυχής.'; // Success message
        statusText.classList.add("text-success")
        statusText.classList.remove("text-danger")
    } else if (response.status === 401) {
        statusText.innerText = 'Η ταυτοποίηση απέτυχε, δοκιμάστε ξανά.'; // Authentication failed
        statusText.classList.add("text-danger")
        statusText.classList.remove("text-success")
    } else {
        statusText.innerText = 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.'; // Generic error
        statusText.classList.add("text-danger")
        statusText.classList.remove("text-success")
    }
    statusText.classList.remove("d-none")
});

// Collect form data and return as a JSON string
function getNewDataJson() {
    return JSON.stringify({
        email: email.value,
        mobile: mobile.value,
        landline: landline.value,
        street: street.value,
        streetNumber: streetNumber.value,
        city: city.value,
        postcode: postcode.value,
        password: password.value
    });
}
