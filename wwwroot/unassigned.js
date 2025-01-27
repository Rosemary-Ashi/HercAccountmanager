document.addEventListener('DOMContentLoaded', () => {
    const roless = sessionStorage.getItem('roles');
    const locationss = sessionStorage.getItem('locations');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');
    const agents = [ //All agents listed
        { userid: '527', username: 'chisom.anyaegbu@gtpensionmanagers.com', locationId: '5' },
        { userid: '528', username: 'ireoluwa.abayomi@gtpensionmanagers.com', locationId: '5' },
        { userid: '529', username: 'haruna.ahmodu@gtpensionmanagers.com', locationId: '5' },
        { userid: '602', username: 'matthew.thomas@gtpensionmanagers.com', locationId: '4' },
        { userid: '601', username: 'daniel.david@gtpensionmanagers.com', locationId: '4' },
        { userid: '490', username: 'oluwakanyinsola.joseph@gtpensionmanagers.com', locationId: '1' },
        { userid: '497', username: 'oseremen.alika@gtpensionmanagers.com', locationId: '1' },
        { userid: '430', username: 'Deborah.Omolade@gtpensionmanagers.com', locationId: '3' },
        { userid: '485', username: 'Gabriel.Ezenwata@gtpensionmanagers.com', locationId: '3' },
        { userid: '433', username: 'deborah.akinyemi@gtpensionmanagers.com', locationId: '1' },
        { userid: '436', username: 'Olatokun.Abraham@gtpensionmanagers.com', locationId: '3' },
        { userid: '494', username: 'chioma.okpara@gtpensionmanagers.com', locationId: '1' },
        { userid: '496', username: 'oluwatumininu.adebajo@gtpensionmanagers.com', locationId: '3' },
        { userid: '278', username: 'immaculate.ukanwoke@gtpensionmanagers.com', locationId: '2' },
        { userid: '242', username: 'esther.sunday@gtpensionmanagers.com', locationId: '2' },
        { userid: '463', username: 'oluwatosin.ero-phillips@gtpensionmanagers.com', locationId: '3' },
        { userid: '533', username: 'samson.abah@gtpensionmanagers.com', locationId: '5' },
        { userid: '617', username: 'abdulmutallab.tukur@gtpensionmanagers.com', locationId: '4' },
        { userid: '440', username: 'anuoluwapo.oluwagbemiro@gtpensionmanagers.com', locationId: '1' },
        { userid: '617', username: 'blessing.chukwu@gtpensionmanagers.com', locationId: '3' },
        { userid: '282', username: 'blessing.njoku@gtpensionmanagers.com', locationId: '2' },
        { userid: '281', username: 'Chiamaka.Chijioke@gtpensionmanagers.com', locationId: '2' },
        { userid: '217', username: 'jeremiah.igbinigie@gtpensionmanagers.com', locationId: '2' },
        { userid: '441', username: 'Iriagbonse.Eweka@gtpensionmanagers.com', locationId: '3' }

    ];

    if (!roless || !usernamess || !locationIdss) {
        alert('User not authenticated or location data missing.');
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#username').textContent = usernamess; //Display username
    document.querySelector('#location').textContent = locationss; //Display location

    async function FetchCustomers(pageNumber = 1, pageSize = 20) {
        try {
            const response = await fetch(`/accountmanager/api/Customer/${locationIdss}/Unassigned?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            return [];
        }
    }

    function renderAssigned(data) {
        const result = document.getElementById('UnassignedTable');
        if (!result) {
            console.error("Element with ID 'UnassignedTable' not found");
            return;
        }

        // Display pagination metadata
        document.getElementById('pagination-metadata').innerHTML = `Page ${data.pageNumber} of ${data.totalPages} (${data.totalRecords} records)`;
        const teamleadlocationid = locationIdss;
        result.innerHTML = data.data.map((assigned, index) => {
            const filteredAgents = agents.filter(agent => agent.locationId === teamleadlocationid);
            const agentOptions = filteredAgents.map(agent => `<option value="${agent.userid}">${agent.username}</option>`).join('');

            return `
            <tr key=${index}>
            <td><input type="checkbox" class="tickCheckbox" data-id="${assigned.customerId}"></td>
            <td>${index + 1}</td>
            <td>${assigned.rsapin}</td>
            <td>${assigned.surname}</td>
            <td>${assigned.firstname}</td>
            <td>${assigned.othername}</td>
            <td>${assigned.locationName}</td>
            <td>${assigned.email}</td>
            <td>${assigned.mobileNumber}</td>
            <td>${assigned.aum}</td>
            <td><select class="selectAgent"><option value="">Select Agent</option>${agentOptions}</select></td>
            </tr>
           `;
        }).join('');

        // Add pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = `
        <button id="previous-button" ${data.pageNumber === 1 ? 'disabled' : ''}>Previous</button>
        <button id="next-button" ${data.pageNumber === data.totalPages ? 'disabled' : ''}>Next</button>
        `;

        document.getElementById('previous-button').addEventListener('click', () => {
            FetchCustomers(data.pageNumber - 1, data.pageSize).then(renderAssigned);
        });

        document.getElementById('next-button').addEventListener('click', () => {
            FetchCustomers(data.pageNumber + 1, data.pageSize).then(renderAssigned);
        });
    }

    async function submitAssignments() {
        const assignments = [];
        console.log(assignments)
        const checkboxes = document.querySelectorAll('.tickCheckbox:checked');
        let allValid = true;

        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const accountId = checkbox.getAttribute('data-id');
            const agentSelect = row.querySelector('.selectAgent');
            const agentId = agentSelect.value || agents;
            if (agentId) {
                // Here, we assume that you need to collect additional data for each selected account.
                assignments.push({ customerId: accountId, bdOfficerId: agentId, status: "Pending" });
            } else {
                allValid = false; // If any checkbox has no agent selected
                agentSelect.style.borderColor = 'red'; // Highlight missing selections
            }
        });

        if (!allValid) {
            alert('Please select an agent for all checked accounts.');
            return;
        }
        if (assignments.length === 0) {
            alert('No valid assignments Request');
            return;
        }

        try {
            const response = await fetch('/accountmanager/api/AssignmentRequest/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignments)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Assignment request submitted successfully!');
            await initAssigned(); // Refresh unassigned table

        } catch (error) {
            console.error('Failed to submit assignment request:', error);
            return [];
        }

    }

    const selectallCheckbox = document.getElementById('selectAll'); //Selectall function

    selectallCheckbox.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.tickCheckbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectallCheckbox.checked;
        });
    });


    document.getElementById('submit-all').addEventListener('click', submitAssignments); //Select assignments
    async function initAssigned() {
        const assignedCustomer = await FetchCustomers();
        renderAssigned(assignedCustomer);
    }

    function searchFunction() { //Search Function
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('UnassignedTable');
        const rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let match = false;

            for (let j = 0; j < cells.length; j++) {
                if (cells[j]) {
                    const cellText = cells[j].textContent || cells[j].innerText;
                    if (cellText.toLowerCase().indexOf(filter) > -1) {
                        match = true;
                        break;
                    }
                }
            }
            rows[i].style.display = match ? '' : 'none';
        }
    }
    document.getElementById('searchWord').addEventListener('keyup', searchFunction);

    window.addEventListener('load', initAssigned);

    function signouts() { //Signout
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts)
});