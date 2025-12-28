const API_BASE = 'http://localhost:8787/api';
const form = document.getElementById('login-form')
const errorMessage = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorMessage.textContent = ''

  const formData = new FormData(form)

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const text = await res.text()
      errorMessage.textContent = text || 'Login failed'
      return
    }

    // On success, redirect
    window.location.href = './../public/index.html';
  } catch (err) {
    errorMessage.textContent = 'Network error'
  }
})
