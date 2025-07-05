document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // prevent page reload

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        window.location.href = '/'; // redirect on success
    } else if (response.status === 401) {
        document.getElementById('errorMsg').innerText = 'Λάθος email ή κωδικός.';
        document.getElementById('errorMsg').style.display = 'block';
    } else {
        document.getElementById('errorMsg').innerText = 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.';
        document.getElementById('errorMsg').style.display = 'block';
    }
});