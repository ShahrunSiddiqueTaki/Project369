import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
  DB: D1Database
}

const signup = new Hono<{ Bindings: Env }>()
signup.use('*', cors())

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

signup.post('/signup', async (c) => {
  const formData = await c.req.formData()

  const user_name = formData.get('username')?.toString()
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()

  if (!user_name || !email || !password || !confirmPassword) {
    return c.text('All fields are required', 400)
  }

  if (password !== confirmPassword) {
    return c.text('Passwords do not match', 400)
  }

  try {
    const existingUser = await c.env.DB
      .prepare('SELECT user_id FROM users WHERE email = ?')
      .bind(email)
      .first()

    if (existingUser) {
      return c.text('Email already registered', 409)
    }

    const passwordHash = await hashPassword(password)

    await c.env.DB
      .prepare(`
        INSERT INTO users (user_name, email, password)
        VALUES (?, ?, ?)
      `)
      .bind(user_name, email, passwordHash)
      .run()

    return c.text('Signup successful', 201)
  } catch (err) {
    console.error(err)
    return c.text('Signup failed', 500)
  }
})

export default signup
