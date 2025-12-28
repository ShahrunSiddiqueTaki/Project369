const API_BASE = 'http://localhost:8787/api';
const addUserForm = document.getElementById('addUserForm')
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
      <td>${user.role}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editUser('${user.user_id}', '${user.role}')">Edit Role</button>
        <button class="action-btn delete-btn" onclick="deleteUser('${user.user_id}')">Delete</button>
      </td>
    `
    usersTableBody.appendChild(tr)
  })
}

// Add new user
addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = document.getElementById('username').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const role = document.getElementById('role').value

  if (!username || !email || !password) return alert('All fields are required!')

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    })
    const data = await res.json()
    if (res.ok) {
      addUserForm.reset()
      fetchUsers()
    } else {
      alert(data.error)
    }
  } catch (error) {
    console.error('Error adding user:', error)
  }
})

// Edit user role
async function editUser(user_id, currentRole) {
  const newRole = prompt(`Enter new role (admin/user):`, currentRole)
  if (!newRole || !['admin', 'user'].includes(newRole.toLowerCase())) return

  try {
    const res = await fetch(`${API_BASE}/users/${user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole.toLowerCase() })
    })
    const data = await res.json()
    if (res.ok) {
      fetchUsers()
    } else {
      alert(data.error)
    }
  } catch (error) {
    console.error('Error updating role:', error)
  }
}

// Delete user
async function deleteUser(user_id) {
  if (!confirm('Are you sure you want to delete this user?')) return

  try {
    const res = await fetch(`${API_BASE}/users/${user_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      fetchUsers()
    } else {
      alert(data.error)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

// Initial fetch
fetchUsers()
