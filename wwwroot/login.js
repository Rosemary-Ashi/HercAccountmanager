document.addEventListener('DOMContentLoaded', () => {
    //Get reference to the form
    const form = document.getElementById('loginform');
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('error-message');
    const simulatedAgents = [
        { userid: '1', username: 'hercules.odoko@gtpensionmanagers.com' },
        { userid: '2', username: 'victoria.ijeoma@gtpensionmanagers.com' },
        { userid: '3', username: 'taiwo.owolabi@gtpensionmanagers.com' }
    ];
    sessionStorage.setItem('userids', JSON.stringify(simulatedAgents));

    console.log(sessionStorage.getItem('userids'));

    //Defining the domain to validate
    const validDomain = 'test.com';

    //Add an event listener to the form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get user input
        const username = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)


        // Fetch request to validate user
        fetch('/accountmanager/api/Auth/ValidateLogin', {
            method: 'POST',
            body: formData,
        })

            .then(response => response.json())
            .then(data => {
                if (data) {

                    localStorage.setItem('logindata', data);
                    sessionStorage.setItem('roles', data.userData.role);
                    sessionStorage.setItem('locations', data.userData.location);
                    sessionStorage.setItem('locationIds', data.userData.locationId);
                    sessionStorage.setItem('usernames', data.userData.username);
                    sessionStorage.setItem('userids', data.userData.userId);
                    sessionStorage.setItem('agentcode', data.userData.agentcode);


                    // Redirect to another page

                    if (data.userData.role === 'bdofficer') {
                        window.location.href = 'bdofficer.html'; //redirect
                    } else if (data.userData.role === 'bdteamlead') {
                        window.location.href = 'bdteamlead.html'; //redirect
                    } else if (data.userData.role === 'bdhead') {
                        window.location.href = 'bdhead.html'; //redirect
                    } else if (data.userData.role === 'Admin') {
                        window.location.href = 'adminDashboard.html'; //redirect
                    } else {
                        alert('Are you a Scammer? How did you get an account?')
                        window.location.href = '/';
                    }

                } else {
                    alert('Invalid username or password.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
})