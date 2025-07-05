async function checkLogin() {
  try {
    const res = await fetch('/api/current-user');
    const data = await res.json();
    if (data.loggedIn) {
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) loginBtn.style.display = 'none';

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.style.display = 'block';

        // Attach logout event here after showing button
        logoutBtn.addEventListener('click', async () => {
          try {
            const logoutRes = await fetch('/logout', { method: 'POST' });
            if (logoutRes.ok) {
              window.location.href = '/'; // redirect after logout
            } else {
              console.error('Logout failed');
            }
          } catch (err) {
            console.error('Error logging out:', err);
          }
        });
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

document.addEventListener('DOMContentLoaded', checkLogin);
