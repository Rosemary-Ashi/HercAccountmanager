document.addEventListener('DOMContentLoaded', () => {
    const roless = sessionStorage.getItem('roles');
    const locationss = sessionStorage.getItem('locations');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');

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

    function renderCustomers(customerdata) {
        const result = document.getElementById('admincustomertable')
        result.innerHTML = customerdata.data.map((cust, index) => {
            return `
            <tr key=${index}>
            <td>${index + 1}</td>
            <td>${cust.rsapin}</td>
            <td>${cust.surname}</td>
            <td>${cust.firstname}</td>
            <td>${cust.othername}</td>
            <td>${cust.locationName}</td>
            <td>${cust.email}</td>
            <td>${cust.mobileNumber}</td>
            <td>${cust.bdofficername}</td>
            </tr>
            `;
        }).join('');

        // Display pagination metadata
        document.getElementById('pagination-metadata').innerHTML = `Page ${customerdata.pageNumber} of ${customerdata.totalPages} (${customerdata.totalRecords} records)`;

        // Display pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = `
        <button id="previous-button" ${customerdata.pageNumber === 1 ? 'disabled' : ''}>Previous</button>
        <button id="next-button" ${customerdata.pageNumber === customerdata.totalPages ? 'disabled' : ''}>Next</button>
        `;

        document.getElementById('previous-button').addEventListener('click', () => {
            FetchCustomers(customerdata.pageNumber - 1, customerdata.pageSize).then(renderCustomers);
        });

        document.getElementById('next-button').addEventListener('click', () => {
            FetchCustomers(customerdata.pageNumber + 1, customerdata.pageSize).then(renderCustomers);
        });
    }

    function populateFilters(Customerlocation, Customersmanager) {
        const locationFilter = document.getElementById('locationFilter');
        locationFilter.innerHTML = '<option value="">Location</option>';
        Customerlocation.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });

        const bdOfficerFilter = document.getElementById('bdOfficerFilter');
        bdOfficerFilter.innerHTML = '<option value="">Account Manager</option>';
        Customersmanager.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager;
            option.textContent = manager;
            bdOfficerFilter.appendChild(option);
        });
    }

    function filterData(datafiltered, filters) {
        return datafiltered.filter(item => {
            const matchesLocation = filters.location === '' || item.locationName === filters.location;
            const matchesBdOfficer = filters.bdOfficer === '' || item.bdofficername === filters.bdOfficer;
            return matchesLocation && matchesBdOfficer;
        });
    }

    async function initCustomer() {
        const Customers = await FetchCustomers();
        const allLocations = [...new Set(Customers.data.map(item => item.locationName))];
        const allManagers = [...new Set(Customers.data.map(item => item.bdofficername))];
        populateFilters(allLocations, allManagers);
        renderCustomers(Customers);

        document.getElementById('locationFilter').addEventListener('change', () => applyFilters(Customers));
        document.getElementById('bdOfficerFilter').addEventListener('change', () => applyFilters(Customers));

        function applyFilters(data) {
            const filters = {
                location: document.getElementById('locationFilter').value,
                bdOfficer: document.getElementById('bdOfficerFilter').value
            };
            const filteredData = filterData(data, filters);
            renderCustomers(filteredData);
        }

    }

    function searchFunction() { //Search Logic
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('admincustomertable');
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

    window.addEventListener('load', initCustomer);

    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts)
});