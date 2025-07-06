async function getUserName() {
    try {
        const res = await fetch('/api/current-user');
        const data = await res.json();
        if (data.loggedIn) {
            const loginBtn = document.getElementById('loginBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            if (loginBtn) {
                loginBtn.classList.add('d-none');
                logoutBtn.classList.remove('d-none');
            }
            const welcomeMsg = document.getElementById('welcomeMsg');
            if (welcomeMsg) {
                welcomeMsg.textContent = `Καλώς ήρθες, ${data.username}`;
                welcomeMsg.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}


async function loadPartials() {
  const navbar = document.getElementById("navbar");
  const footer = document.getElementById("footer");

  try {
    if (footer) {
        console.log('Fetching footer...');
      const resFoot = await fetch("/partials/footer.html");
      if (!resFoot.ok) throw new Error(`HTTP error! status: ${resFoot.status}`);
      const footHtml = await resFoot.text();
      footer.innerHTML = footHtml;
    }
    if (navbar) {
        console.log('Fetching navbar...');
      const resNav = await fetch("/partials/navbar.html");
      if (!resNav.ok) throw new Error(`HTTP error! status: ${resNav.status}`);
      const navHtml = await resNav.text();
      navbar.innerHTML = navHtml;
    }

    await getUserName();

  } catch (err) {
    console.error("Error loading partials or user info:", err);
  }
      document.body.style.visibility = 'visible'; // <-- Reveal page here
}

document.addEventListener('DOMContentLoaded', loadPartials);
