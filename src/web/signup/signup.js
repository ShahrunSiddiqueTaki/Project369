const API_BASE = 'http://localhost:8787/api';
const form = document.getElementById('signup-form')
const errorMessage = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorMessage.textContent = ''

  const formData = new FormData(form)
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (password !== confirmPassword) {
    errorMessage.textContent = 'Passwords do not match'
    return
  }

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const text = await res.text()
      errorMessage.textContent = text || 'Signup failed'
      return
    }

    // Success → redirect to login
    window.location.href = './../login/login.html';
  } catch {
    errorMessage.textContent = 'Network error'
  }
})
