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
    document.querySelector('#location').textContent = location;

    async function FetchPending() {
        try {
            const response = await fetch(`/accountmanager/api/AssignmentRequest/pending`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const datas = await response.json();
            return datas;
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            return [];
        }
    };

    function renderAssign(datas) {
        const result = document.getElementById('pendingtable')
        result.innerHTML = datas.map((assign, index) => {
            return ` 
              <tr>
              
                  <td>${index + 1}</td>
                  <td>${assign.status}</td>
                  <td>${assign.lastname}</td>
                  <td>${assign.firstname}</td>
                  <td>${assign.location}</td>
                  <td>${assign.aum}</td>
                  <td>${assign.bdOfficerName}</td> 
                  
              </tr>
              `;
        }).join('');
    }

    function populateFilters(Customerlocation, Customersmanager) {
        const locationFilter = document.getElementById('locationfilter');
        locationFilter.innerHTML = '<option value="">Location</option>';
        Customerlocation.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });

        const bdOfficerFilter = document.getElementById('bdOfficerFilter');
        bdOfficerFilter.innerHTML = '<option value="">Agent Assigned</option>';
        Customersmanager.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager;
            option.textContent = manager;
            bdOfficerFilter.appendChild(option);
        });
    }

    function filterData(datafiltered, filters) {
        return datafiltered.filter(item => {
            const matchesLocation = filters.location === '' || item.location === filters.location;
            const matchesBdOfficer = filters.bdOfficer === '' || item.bdOfficerName === filters.bdOfficer;
            return matchesLocation && matchesBdOfficer;
        });
    }

    async function init() {
        const accounts = await FetchPending();
        const allLocations = [...new Set(accounts.map(item => item.location))];
        const allManagers = [...new Set(accounts.map(item => item.bdOfficerName))];
        populateFilters(allLocations, allManagers);
        renderAssign(accounts);

        document.getElementById('locationfilter').addEventListener('change', () => applyFilters(accounts));
        document.getElementById('bdOfficerFilter').addEventListener('change', () => applyFilters(accounts));

        function applyFilters(data) {
            const filters = {
                location: document.getElementById('locationfilter').value,
                bdOfficer: document.getElementById('bdOfficerFilter').value
            };
            const filteredData = filterData(data, filters);
            renderAssign(filteredData);
        }
    }

    function searchFunction() {
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('pendingtable');
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

    window.addEventListener('load', init);

    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts);

});