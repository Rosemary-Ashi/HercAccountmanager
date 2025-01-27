document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit');
    const roless = sessionStorage.getItem('roles');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');


    if (!roless || !usernamess || !locationIdss) {
        alert('User not authenticated or location data missing.');
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#username').textContent = usernamess;

    if (submitButton) {
        submitButton.addEventListener('click', submitregistration);
    } else {
        console.error("Submit button not found in the DOM.");
    }

    function submitregistration() {
        const name = document.getElementById('fullname')?.value;
        const username = document.getElementById('usernames')?.value;
        const email = document.getElementById('emails')?.value;
        const agentCode = document.getElementById('agentcodes')?.value;
        const locationId = document.getElementById('Idlocations')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('password2')?.value;

        if (!name || !username || !email || !agentCode || !password || !locationId || !confirmPassword) {
            alert('Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const formData = {
            name,
            username,
            email,
            agentCode,
            locationId,
            password,
            confirmPassword,
        };

        fetch('/Accountmanager/api/Auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                alert('Registration successful!');
                sessionStorage.setItem('Username', username);
                window.location.href = 'Role.html'
            })
            .catch((error) => {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
            });
    }
    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts)
});