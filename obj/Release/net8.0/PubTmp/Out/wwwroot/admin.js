document.addEventListener('DOMContentLoaded', () => {
  const role = sessionStorage.getItem('roles');
  const location = sessionStorage.getItem('locations');
  const username = sessionStorage.getItem('usernames');

  if (!role || !username || !location) {
    alert('User not authenticated or location data missing.');
    window.location.href = 'login.html';
    return;
  }

  document.querySelector('#username').textContent = username;

    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts);
});