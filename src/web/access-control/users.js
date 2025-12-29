const API_BASE = 'http://localhost:8787/api';
const usersTableBody = document.querySelector('#usersTable tbody')

// Fetch users from API
async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`)
    const users = await res.json()
    populateTable(users)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

// Populate table with users
function populateTable(users) {
  usersTableBody.innerHTML = ''
  users.forEach(user => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${user.user_name}</td>
      <td>${user.email}</td>
      <td id="role_${user.user_id}">${user.role}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editUser(${user.user_id})">Edit Role</button>
        <button class="action-btn delete-btn" onclick="deleteUser(${user.user_id})">Delete</button>
      </td>
    `
    usersTableBody.appendChild(tr)
  })
}

async function editUser(userId) {
  const currentRole = document.getElementById(`role_${userId}`);


  try {
    const res = await fetch(`${API_BASE}/roles`);
    const roles = await res.json();
    let html = `<select name="roles" id="roles_0">`;
    roles.forEach(role => {
      html += `<option value="${role.role_id}">${role.role_name}</option>`;
    });  
    html += `
    </select>
    <button class="action-btn save-btn" onclick="updateRole(${userId})">Save</button>
    <button class="action-btn cancel-btn" onclick="fetchUsers()">Cancel</button>
    `;
    currentRole.innerHTML = html;
  } catch (error) {
      console.error('Error fetching roles:', error)
  }
}

async function updateRole(userId) {
  
  const select = document.getElementById('roles_0');
  const userRole = select.value;

  try {
    const res = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: userRole })
    })
    if (!res.ok) throw new Error('Failed to update role');
    fetchUsers();
    alert('User role updated!');
  } catch (error) {
      console.error(error);
  }
}

// Delete User
async function deleteUser(userId) {
  try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE'
  })
    if (!res.ok) throw new Error('Failed to delete role!');
    fetchUsers();
  } catch (error) {
      console.error(error);
  }
}

// Initial fetch
fetchUsers()
