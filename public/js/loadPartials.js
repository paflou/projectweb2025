// Holds user data after fetching from the server
let data = null;

// Fetches the current user's information from the server
async function getUserName() {
    try {
        const res = await fetch('/api/current-user');                       // Request user info
        data = await res.json();                                            // Parse response as JSON
        if (data.loggedIn) {                                                // If user is logged in
            const loginBtn = document.getElementById('loginBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            if (loginBtn) {
                loginBtn.classList.add('d-none');                           // Hide login button
                logoutBtn.classList.remove('d-none');                       // Show logout button
            }
            const welcomeMsg = document.getElementById('welcomeMsg');
            if (welcomeMsg) {
                welcomeMsg.textContent = `Καλώς ήλθατε, ${data.username}`; // Show welcome message
                welcomeMsg.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

// Shows professor-specific navbar items
function loadProfNavbarItems() {
    const navbarItems = document.getElementsByClassName("professor-items");
    for (let i = 0; i < navbarItems.length; i++) {
        navbarItems[i].classList.remove('d-none');
    }
}

// Shows secretary-specific navbar items
function loadSecretaryNavbarItems() {
    const navbarItems = document.getElementsByClassName("secretary-items");
    for (let i = 0; i < navbarItems.length; i++) {
        navbarItems[i].classList.remove('d-none');
    }
}

// Shows student-specific navbar items
function loadStudentNavbarItems() {
    const navbarItems = document.getElementsByClassName("student-items");
    for (let i = 0; i < navbarItems.length; i++) {
        navbarItems[i].classList.remove('d-none');
    }
}

// Determines which navbar items to show based on user role
function loadNavbarItems() {
    if (!data || !data.loggedIn) return; // Do nothing if not logged in

    switch (data.role) {
        case 'professor':
            loadProfNavbarItems();
            break;
        case 'secretary':
            loadSecretaryNavbarItems();
            break;
        case 'student':
            loadStudentNavbarItems();
            break;
        default:
            console.warn('Unknown role:', data.role);
    }
}

// Loads navbar and footer partials, then user info and navbar items
async function loadPartials() {
    const navbar = document.getElementById("navbar");
    const footer = document.getElementById("footer");

    try {
        if (footer) {
            console.log('Fetching footer...');
            const resFoot = await fetch("/partials/footer.html");                                   // Fetch footer HTML
            if (!resFoot.ok) throw new Error(`HTTP error! status: ${resFoot.status}`);
            const footHtml = await resFoot.text();
            footer.innerHTML = footHtml;                                                            // Insert footer HTML
        }
        if (navbar) {
            console.log('Fetching navbar...');
            const resNav = await fetch("/partials/navbar.html");                                    // Fetch navbar HTML
            if (!resNav.ok) throw new Error(`HTTP error! status: ${resNav.status}`);
            const navHtml = await resNav.text();
            navbar.innerHTML = navHtml;                                                             // Insert navbar HTML
        }
        await getUserName();                                                                        // Fetch user info and update UI
        loadNavbarItems();                                                                          // Show role-specific navbar items
    } catch (err) {
        console.error("Error loading partials or user info:", err);
    }
    document.body.style.visibility = 'visible';                                                     // Reveal page after loading
}

// Run loadPartials when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadPartials);
