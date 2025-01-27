document.addEventListener('DOMContentLoaded', () => {
    const roless = sessionStorage.getItem('roles');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');
    const customerId = sessionStorage.getItem('customerId');

    if (!customerId) {
        alert('customer id not stored');
        window.location.href = 'bdofficer.html';
        return;
    }

    if (!roless || !usernamess || !locationIdss) {
        alert('User not authenticated or location data missing.');
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#username').textContent = usernamess;

    async function fetchComments(customerId) {
        try {
            console.log('customerId', customerId);
            const response = await fetch(`/accountmanager/api/Comments/${customerId}/comments`);
            if (!response.ok) {
                throw new Error(`Error fetching comments: ${response.status}`);
            }
            const comments = await response.json();
            return comments;
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    };

    function renderComments(comments) {
        const result = document.getElementById('commentsContainer');
        result.innerHTML = comments.map((comment, index) => {
            return `
            <tr key=${index}>
            <td>${index + 1}</td>
            <td>${comment.commentDetails}</td>
            <td>${new Date(comment.commentDate).toLocaleDateString()}</td>
            <td>${new Date(comment.commentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: undefined })}</td>
          `;
        }).join('');
    }
    async function initrenderComments() {
        const comments = await fetchComments(customerId);
        renderComments(comments);
    }

    function searchFunction() {
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('commentsContainer');
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

    document.getElementById('exportbtn').addEventListener('click', () => {
        exportToExcel('ExportedData');
    });
    function exportToExcel() {
        const table = document.getElementById('customertable');
        const rows = Array.from(table.rows);

        const csvContent = rows.map(row => {
            const cells = Array.from(row.cells);
            return cells.map(cell => `"${cell.textContent}"`).join(',');
        }).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Comments.csv';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    window.addEventListener('load', initrenderComments);

    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts)
});