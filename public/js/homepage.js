async function checkLogin() {
  try {
    const res = await fetch('/api/current-user');
    const data = await res.json();
    if (data.loggedIn) {
      if (data.role === 'professor') {
        window.location.href = '/prof'; // redirect on success
      }
      else if (data.role === 'student') {
        window.location.href = '/student'; // redirect on success
      }
      else if (data.role === 'secretary') {
        window.location.href = '/secretary'; // redirect on success
      }
    }
  } catch (error) {
    console.error('Error checking login status:', error);
  }
}

document.addEventListener('DOMContentLoaded', checkLogin);
