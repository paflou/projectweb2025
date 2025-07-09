// Add event listener to the login form for the submit event
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission (page reload)

    // Get the values from the email and password input fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Send a POST request to the /login endpoint with the email and password as JSON
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    // Handle the response from the server
    if (response.ok) {
        // If login is successful, redirect to the homepage
        window.location.href = '/';
    } else if (response.status === 401) {
        // If credentials are incorrect, show an error message
        document.getElementById('errorMsg').innerText = 'Λάθος email ή κωδικός.';
        document.getElementById('errorMsg').style.display = 'block';
    } else {
        // For any other error, show a generic error message
        document.getElementById('errorMsg').innerText = 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.';
        document.getElementById('errorMsg').style.display = 'block';
    }
});