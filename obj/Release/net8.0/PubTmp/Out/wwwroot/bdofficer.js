document.addEventListener('DOMContentLoaded', () => {
    const roless = sessionStorage.getItem('roles');
    const locationss = sessionStorage.getItem('locations');
    const locationIdss = sessionStorage.getItem('locationIds');
    const usernamess = sessionStorage.getItem('usernames');
    const userIdss = sessionStorage.getItem('userids');
    let globalCustomerId;

    if (!roless || !usernamess || !locationIdss) {
        alert('User not authenticated or location data missing.');
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#username').textContent = usernamess;
    document.querySelector('#location').textContent = locationss;

    async function FetchAgentCustomer(pageNumber = 1, pageSize = 10) {
        try {
            const response = await fetch(`/accountmanager/api/Customer/${userIdss}/ByAgent?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            return [];
        }
    };


    async function fetchLatestCommentDate(customerId) {
        try {
            const response = await fetch(`/accountmanager/api/Comments/${customerId}/comments`);
            if (!response.ok) {
                throw new Error(`Error fetching comments for customer ID: ${customerId}`);
            }
            const comments = await response.json();
            if (comments.length === 0) return { date: 'No comments yet', time: '' };

            // Get the latest comment
            const latestComment = comments.reduce((latest, comment) => {
                const commentDate = new Date(comment.commentDate);
                return commentDate > latest ? commentDate : latest;
            }, new Date(0));

            const latestCommentDate = comments.reduce((latest, comment) => {
                const commentTime = new Date(comment.commentDate);
                return commentTime > latest ? commentTime : latest;
            }, new Date(0));

            return {
                date: latestCommentDate.toLocaleDateString(),
                time: latestComment.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            return { date: 'No comment yet', time: 'No comment yet' };
        }
    }
    async function renderAssigned(data) {
        const result = document.getElementById('bdofficertable');
        document.getElementById('paginations-metadata').innerHTML = `Page ${data.pageNumber} of ${data.totalPages} (${data.totalRecords} records)`;

        result.innerHTML = await Promise.all(
            data.data.map(async (employee, index) => {
                const { date: latestCommentDate, time: latestComment } = await fetchLatestCommentDate(employee.customerId);

                return ` 
                <tr key=${index}>
                <td>${index + 1}</td>
                <td>${employee.rsapin}</td>
                <td>${employee.surname}</td>
                <td>${employee.firstname}</td>
                <td>${employee.othername}</td>
                <td>${employee.locationName}</td>
                <td>${employee.email}</td> 
                <td>${employee.mobileNumber}</td>
                <td>
                <input type="text" class="comment-input" data-id="${employee.customerId}" placeholder="Enter comment">
                <button class="submit-btn" data-id="${employee.customerId}">Submit</button>
                <a href="Comments.html" class="View-comments-link" data-id="${employee.customerId}">View Comments</a>
                </td>
                <td class="timestamp">${latestComment}</td>
                <td class="datestamp">${latestCommentDate}</td>
                </tr>
                `;
            })
        ).then(rows => rows.join(''));

        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = ` 
        <button id="previous-button" ${data.pageNumber === 1 ? 'disabled' : ''}>Previous</button>
        <button id="next-button" ${data.pageNumber === data.totalPages ? 'disabled' : ''}>Next</button>
        `;

        document.getElementById('previous-button').addEventListener('click', () => {
            FetchAgentCustomer(data.pageNumber - 1, data.pageSize).then(renderAssigned);
        });

        document.getElementById('next-button').addEventListener('click', () => {
            FetchAgentCustomer(data.pageNumber + 1, data.pageSize).then(renderAssigned);
        });

        document.querySelectorAll('.submit-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                globalCustomerId = event.target.getAttribute('data-id');
                const commentInput = document.querySelector(`.comment-input[data-id="${globalCustomerId}"]`);
                const commentText = commentInput.value.trim();
                if (commentText) {
                    await postComment(globalCustomerId, commentText);
                    commentInput.value = ''; // Clear the input field after posting
                } else {
                    alert('Please enter a comment');
                }
            });
        });

        document.querySelectorAll('.View-comments-link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const customerId = event.target.getAttribute('data-id');
                sessionStorage.setItem('customerId', customerId); // Save customerId to sessionStorage
                window.location.href = 'Comments.html'; // Redirect to comments page
            });
        });
    }

    async function postComment(customerId, commentText) {
        const payload = {
            customerId: customerId,
            CommentDetails: commentText,
            commentDate: new Date().toISOString()
        };

        try {
            const response = await fetch(`/accountmanager/api/Comments/${customerId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server response error:', errorData);
                alert(`Error: ${response.status} - ${errorData.title || 'An error occurred'}`);
                throw new Error(`Error: ${response.status}`);
            } else {
                alert('Comment added successfully');
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    }

    async function initagentcustomer() {
        const agentCustomer = await FetchAgentCustomer();
        renderAssigned(agentCustomer);
    }

    function searchFunction() {
        const input = document.getElementById('searchWord');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('bdofficertable');
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

    window.addEventListener('load', initagentcustomer);

    function signouts() {
        sessionStorage.clear();
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c.trim().replace(/=.*$/, '=;expires=Thu, 01 Jan 1970 12:15:60 GMT');
        });
        window.location.href = 'login.html'
    }

    document.getElementById('signout').addEventListener('click', signouts)
});