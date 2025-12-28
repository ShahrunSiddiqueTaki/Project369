import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// Same SHA-256 hashing as in signup
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// POST /api/login
app.post('/login', async (c) => {
  const formData = await c.req.formData()

  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return c.text('Email and password are required', 400)
  }

  try {
    // Look up user by email
    const user = await c.env.DB
      .prepare('SELECT user_id, password FROM users WHERE email = ?')
      .bind(email)
      .first()

    if (!user) {
      return c.text('Invalid email or password', 401)
    }

    const passwordHash = await hashPassword(password)

    if (user.password !== passwordHash) {
      return c.text('Invalid email or password', 401)
    }

    // Login successful
    return c.text('Login successful', 200)
  } catch (err) {
    console.error(err)
    return c.text('Login failed', 500)
  }
})

export default app
