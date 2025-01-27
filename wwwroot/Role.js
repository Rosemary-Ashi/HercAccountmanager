document.addEventListener('DOMContentLoaded', () => {
    const roless = sessionStorage.getItem('roles');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');

    if (!roless || !usernamess || !locationIdss) {
        alert('User not authenticated or location data missing.');
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#username').textContent = usernamess;

    const emailfield = document.getElementById('email');
    const Roleform = document.getElementById('assignRole');
    const UserName = sessionStorage.getItem('Username');
    emailfield.value = UserName;

    Roleform.addEventListener('submit', (e) => {
        e.preventDefault();
        const User = emailfield.value;
        const Userrole = document.getElementById('userrole').value;

        if (!Userrole) {
            alert('Please select a role.');
            return;
        }

        fetch('/accountmanager/api/Role/assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({ email: User, role: Userrole }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP eeror! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((data) => {
                alert(`Role '${Userrole}' assigned to user '${User}' successfully`);
                window.location.href = 'User.html'
            })
            .catch((error) => {
                console.error('Role assignment failed: ', error);
                alert('Failed to assign role.');
            })
    })
    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts)
});