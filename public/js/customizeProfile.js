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

document.addEventListener('DOMContentLoaded', populateForm);
password.addEventListener('input', enableSaveButton);


async function populateForm() {
    const response = await fetch('/student/get-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    const info = data.info


    if (email) email.value = info.email;
    if (mobile) mobile.value = info.mobile;
    if (landline) landline.value = info.landline;
    if (street) street.value = info.street;
    if (streetNumber) streetNumber.value = info.street_number;
    if (city) city.value = info.city;
    if (postcode) postcode.value = info.postcode;

    enableSaveButton();
}

function enableSaveButton() {
    if (password.value.trim() !== "") {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}


form.addEventListener('submit', async function (e) {
    e.preventDefault(); // prevent page reload

    const response = await fetch('/student/get-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: getNewDataJson()
    });

    if (response.ok) {
        statusText.innerText = 'Η καταχώρηση σας ήταν επιτυχής.';
        statusText.classList.add("text-success")
        statusText.classList.remove("text-danger")
    } else if (response.status === 401) {
        statusText.innerText = 'Η ταυτοποίηση απέτυχε, δοκιμάστε ξανά.';
        statusText.classList.add("text-danger")
        statusText.classList.remove("text-success")
    } else {
        statusText.innerText = 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.';
        statusText.classList.add("text-danger")
        statusText.classList.remove("text-success")
    }
    statusText.classList.remove("d-none")
});


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
