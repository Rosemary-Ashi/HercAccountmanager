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

  document.querySelector('#username').textContent = usernamess;
  document.querySelector('#location').textContent = locationss;

  async function FetchCustomersBDHead() {
    try {
        const response = await fetch(`/accountmanager/api/AssignmentRequest`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const BDHeaddata = await response.json();
      console.log('BD Head Fetched Data', BDHeaddata);
      return BDHeaddata;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return [];
    }
  };

  function renderAssign(BDHeaddata) {
    const results = document.getElementById('BDHeadAssignedTable')

    results.innerHTML = BDHeaddata.map((approved, index) => {
      return ` 
      <tr key=${index}>
          <td>${index + 1}</td>
          <td>${approved.lastname}</td>
          <td>${approved.firstname}</td>
          <td>${approved.location}</td>            
          <td>${approved.aum}</td>
          <td>${approved.bdOfficerName}</td>
      </tr>
      `;
    }).join('');
  }

  function populateFilters(Customerlocation, Customersmanager) {
    const locationfilter = document.getElementById('locationFilter');
    locationfilter.innerHTML = '<option value="">Location</option>';
    Customerlocation.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationfilter.appendChild(option);
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
        const matchesLocation = filters.location === '' || item.location === filters.location;
        const matchesBdOfficer = filters.bdOfficer === '' || item.bdOfficerName === filters.bdOfficer;
        return matchesLocation && matchesBdOfficer;
    });
}

  async function initAssign() {
    const assignedCustomers = await FetchCustomersBDHead();
    const allLocations = [...new Set(assignedCustomers.map(item => item.location))];
    const allManagers = [...new Set(assignedCustomers.map(item => item.bdOfficerName))];
    populateFilters(allLocations, allManagers);
    renderAssign(assignedCustomers);

    document.getElementById('locationFilter').addEventListener('change', () => applyFilters(assignedCustomers));
    document.getElementById('bdOfficerFilter').addEventListener('change', () => applyFilters(assignedCustomers));

      function applyFilters(data) {
        const filters = {
            location: document.getElementById('locationFilter').value,
            bdOfficer: document.getElementById('bdOfficerFilter').value
          };
          const filteredData = filterData(data, filters);
          renderAssign(filteredData);
        }
  }

  window.addEventListener('load', initAssign);

  function signouts() {
    sessionStorage.clear();
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
    });
    window.location.href = 'login.html'
  }

  document.getElementById('signout').addEventListener('click', signouts)
});