document.addEventListener('DOMContentLoaded', () => {
    const roless = sessionStorage.getItem('roles');
    const locationss = sessionStorage.getItem('locations');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');
    FetchCustomerDashboard().then(renderAssignedDash);
    FetchCustomers().then(renderAssigned);


    if (!roless || !usernamess || !locationIdss) {
        alert('User not authenticated or location data missing.');
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#username').textContent = usernamess;
    document.querySelector('#location').textContent = locationss;


    /*****************************************BEGINNING OF ASSIGNED API***************************************************/

    async function FetchCustomers(pageNumber = 1, pageSize = 20) {
        try {
            const response = await fetch(`/accountmanager/api/Customer/${locationIdss}/Assigned?pageNumber=${pageNumber}&pageSize=${pageSize}`);
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
        const result = document.getElementById('teamleadtable')
        if (!result) {
            console.error("Element with ID 'teamleadtable' not found.");
            return;
        }

        result.innerHTML = data.map((assigned, index) => {
            const formattedComments = Array.isArray(assigned.commentDetails) && assigned.commentDetails.length > 0
                ? assigned.commentDetails[0].commentDetails
                : 'No comments yet';
            const CommentsTime = Array.isArray(assigned.commentDetails) && assigned.commentDetails.length > 0
                ? new Date(assigned.commentDetails[0].commentDate).toLocaleDateString()
                : 'No comments yet';

            return ` 
            <tr key=${index}>
                <td>${index + 1}</td>
                <td>${assigned.rsapin}</td>
                <td>${assigned.surname}</td>
                <td>${assigned.firstname}</td>
                <td>${assigned.othername}</td>
                <td>${assigned.locationName}</td>
                <td>${assigned.email}</td> 
                <td>${assigned.mobileNumber}</td>             
                <td>${assigned.aum}</td>
                <td>${assigned.bdOfficer}</td>
                <td>${formattedComments}</td>
                <td><button href="Comments.html" class="commentBD" data-id="${assigned.customerId}">Comments
                </button></td>
                <td>${CommentsTime}</td>
            </tr>
            `;
        }).join('');

        //document.getElementById('paginations-metadata').innerHTML = `Page ${data.pageNumber} of ${data.totalPages} (${data.totalRecords} records)`;

        // Display pagination controls
  //      const paginationControls = document.getElementById('pagination-controls');
  //      paginationControls.innerHTML = `
  //  <button id="previous-button" ${data.pageNumber === 1 ? 'disabled' : ''}>Previous</button>
  //  <button id="next-button" ${data.pageNumber === data.totalPages ? 'disabled' : ''}>Next</button>
  //`;

  //      document.getElementById('previous-button').addEventListener('click', () => {
  //          FetchCustomers(data.pageNumber - 1, data.pageSize).then(renderAssigned);
  //      });

  //      document.getElementById('next-button').addEventListener('click', () => {
  //          FetchCustomers(data.pageNumber + 1, data.pageSize).then(renderAssigned);
  //      });

        document.querySelectorAll('.commentBD').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const customerId = event.target.getAttribute('data-id');
                sessionStorage.setItem('customerId', customerId); // Save customerId to sessionStorage
                window.location.href = 'Comments.html'; // Redirect to comments page
            });
        });

        const table = document.getElementById("teamleadtable");
        const totalRows = table.rows.length;
        // const dataRows = totalRows - 1;

        //document.getElementById("rowCount").innerText = `Unassigned customers are ${totalRows}`;
    }

    function populateFilters(managers) {
        const bdOfficerFilter = document.getElementById('bdOfficerFilter');
        bdOfficerFilter.innerHTML = '<option value="">Account Manager</option>';
        managers.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager;
            option.textContent = manager;
            bdOfficerFilter.appendChild(option);
        });
    }

    function filterData(data, filters) {
        return data.filter(item => {
            const matchesBdOfficer = filters.bdOfficers === '' || item.bdOfficer === filters.bdOfficers;
            return matchesBdOfficer;
        });
    }

    async function initAssigned() {
        const assignedCustomer = await FetchCustomers();
        const allManagers = [...new Set(assignedCustomer.data.map(item => item.bdOfficer))];
        renderAssigned(assignedCustomer);

        document.getElementById('bdOfficerFilter').addEventListener('change', () => applyFilters(assignedCustomer));

        function applyFilters(data) {
            const filters = {
                bdOfficers: document.getElementById('bdOfficerFilter').value
            };
            const filteredData = filterData(data, filters);
            renderAssigned(filteredData);
        }
    }

    function searchFunctions() {
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('teamleadtable');
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
    document.getElementById('searchWord').addEventListener('keyup', searchFunctions);
    window.addEventListener('load', initAssigned);
    /*****************************************END OF ASSIGNED API***************************************************/


    /*****************************************BEGINNING OF DASHBOARD API***************************************************/

    async function FetchCustomerDashboard(pageNumber = 1, pageSize = 20) {
        try {
            const response = await fetch(`/accountmanager/api/Customer/?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const dataDash = await response.json();
            return dataDash;
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            return [];
        }
    }

    function renderAssignedDash(dataDash) {
        const result = document.getElementById('teamleadtableDash')
        if (!result) {
            console.error("Element with ID 'teamleadtableDash' not found.");
            return;
        }
        if (!dataDash || dataDash.length === 0) {
            console.warn("No data provided to renderAssignedDash.");
            result.innerHTML = '<tr><td colspan="12">No assigned customers found.</td></tr>';
            return;
        }
        let rowCounter = 0;
        /***To enable the counter start from one regardless of the position of the data on the DB****/
        result.innerHTML = dataDash.data.map((assigned) => {
            if (assigned.locationName === locationss)/*Location hides if locationName on table is not same as the teamleads location stored in session storage*/ {
                rowCounter++;
                return `
        <tr>
          <td>${rowCounter}</td>
          <td>${assigned.rsapin}</td>
          <td>${assigned.surname}</td>
          <td>${assigned.firstname}</td>
          <td>${assigned.othername}</td>
          <td>${assigned.locationName}</td>
          <td>${assigned.email}</td>
          <td>${assigned.mobilenumber}</td>
          <td>${assigned.aum}</td>
          <td>${assigned.bdofficername}</td>
        </tr>
      `;
            } else {
                return '';
            }
        }).join('');

        document.getElementById("pagination-metadata").innerHTML = `Page ${dataDash.pageNumber} of ${dataDash.totalPages} (${dataDash.totalRecords} records)`;

        // Display pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = `
    <button id="previous-button" ${dataDash.pageNumber === 1 ? 'disabled' : ''}>Previous</button>
    <button id="next-button" ${dataDash.pageNumber === dataDash.totalPages ? 'disabled' : ''}>Next</button>
  `;

        document.getElementById('previous-button').addEventListener('click', () => {
            FetchCustomerDashboard(dataDash.pageNumber - 1, dataDash.pageSize).then(renderAssignedDash);
        });

        document.getElementById('next-button').addEventListener('click', () => {
            FetchCustomerDashboard(dataDash.pageNumber + 1, dataDash.pageSize).then(renderAssignedDash);
        });

        const table = document.getElementById("teamleadtableDash");
        let tablerow = 0;
        for (i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            const totalRowsCell = row.cells[9].innerText.trim();
            if (!totalRowsCell || totalRowsCell.toLowerCase() === "null") {
                tablerow++;
            }
        }
        document.getElementById("dashrow").innerText = `${tablerow}`;
    }


    function filterDataDash(dataDash, filtersDash) {
        return dataDash.filter(item => {
            const matchesBdOfficer = filtersDash.bdOfficers === '' || item.bdOfficer === filtersDash.bdOfficers;
            return matchesBdOfficer;
        });
    }

    async function initAssignedDash() {
        const assignedCustomerDash = await FetchCustomerDashboard();
        const allManagersDash = [...new Set(assignedCustomerDash.data.map(item => item.bdOfficer))];
        populateFilters(allManagersDash);
        renderAssignedDash(assignedCustomerDash.data);

        document.getElementById('bdOfficerFilter').addEventListener('change', () => applyFilters(assignedCustomerDash.data));

        function applyFilters(dataDash) {
            const filters = {
                bdOfficers: document.getElementById('bdOfficerFilter').value
            };
            const filteredData = filterDataDash(dataDash, filters);
            renderAssignedDash(filteredData);
        }
    }

    async function initAssignedDash() {
        const assignedCustomerDash = await FetchCustomerDashboard();
        const allManagersDash = [...new Set(assignedCustomerDash.data.map(item => item.bdOfficer))];
        populateFilters(allManagersDash);
        renderAssignedDash(assignedCustomerDash.data);
        document.getElementById("pagination-metadata").innerHTML = `Page ${assignedCustomerDash.pageNumber} of ${assignedCustomerDash.totalPages} (${assignedCustomerDash.totalRecords} records)`;

        // Display pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = `
    <button id="previous-button" ${assignedCustomerDash.pageNumber === 1 ? 'disabled' : ''}>Previous</button>
    <button id="next-button" ${assignedCustomerDash.pageNumber === assignedCustomerDash.totalPages ? 'disabled' : ''}>Next</button>
  `;

        document.getElementById('previous-button').addEventListener('click', () => {
            FetchCustomerDashboard(assignedCustomerDash.pageNumber - 1, assignedCustomerDash.pageSize).then(data => {
                initAssignedDash();
            });
        });

        document.getElementById('next-button').addEventListener('click', () => {
            FetchCustomerDashboard(assignedCustomerDash.pageNumber + 1, assignedCustomerDash.pageSize).then(data => {
                initAssignedDash();
            });
        });

        document.getElementById('bdOfficerFilter').addEventListener('change', () => applyFilters(assignedCustomerDash.data));

        function applyFilters(dataDash) {
            const filters = {
                bdOfficers: document.getElementById('bdOfficerFilter').value
            };
            const filteredData = filterDataDash(dataDash, filters);
            renderAssignedDash(filteredData);
        }
    }
    function searchFunction() {
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const tables = document.getElementById('teamleadtableDash');
        const rows = tables.getElementsByTagName('tr');

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
    window.addEventListener('load', initAssignedDash);
    /*****************************************END OF DASHBOARD API***************************************************/

    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts);
});