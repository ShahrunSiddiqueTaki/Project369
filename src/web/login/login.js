const form = document.getElementById('login-form')
const errorMessage = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorMessage.textContent = ''

  const formData = new FormData(form)

  try {
    const res = await fetch('/login', {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const text = await res.text()
      errorMessage.textContent = text || 'Login failed'
      return
    }

    // On success, redirect
    window.location.href = '/dashboard'
  } catch (err) {
    errorMessage.textContent = 'Network error'
  }
})
