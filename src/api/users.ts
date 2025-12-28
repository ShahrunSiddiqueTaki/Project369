import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// Helper: Get role_id from role name
async function getRoleId(db: D1Database, role_name: string) {
  const res = await db.prepare('SELECT role_id FROM roles WHERE role_name = ?')
                      .bind(role_name)
                      .all()
  return res.results[0]?.role_id || null
}

// GET /api/users -> list all users with roles
app.get('/users', async (c) => {
  const db = c.env.DB
  const res = await db.prepare(`
    SELECT u.user_id, u.user_name, u.email, r.role_name AS role
    FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.role_id
  `).all()

  return c.json(res.results)
})

// POST /api/users -> add new user
app.post('/users', async (c) => {
  const db = c.env.DB
  const { username, email, password, role } = await c.req.json()

  if (!username || !email || !password || !role) {
    return c.json({ error: 'Missing fields' }, 400)
  }

  // Insert user
  const insertUser = await db.prepare(
    'INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)'
  ).bind(username, email, password).run()

  const user_id = insertUser.meta?.last_row_id
  if (!user_id) return c.json({ error: 'Failed to create user' }, 500)

  // Assign role
  const role_id = await getRoleId(db, role)
  if (!role_id) return c.json({ error: 'Invalid role' }, 400)

  await db.prepare(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)'
  ).bind(user_id, role_id).run()

  return c.json({ message: 'User created successfully' })
})

// PUT /api/users/:id -> update user role
app.put('/users/:id', async (c) => {
  const db = c.env.DB
  const user_id = parseInt(c.req.param('id'))
  const { role } = await c.req.json()

  if (!role) return c.json({ error: 'Role is required' }, 400)

  const role_id = await getRoleId(db, role)
  if (!role_id) return c.json({ error: 'Invalid role' }, 400)

  const existing = await db.prepare(
    'SELECT * FROM user_roles WHERE user_id = ?'
  ).bind(user_id).all()

  if (existing.results.length) {
    await db.prepare(
      'UPDATE user_roles SET role_id = ? WHERE user_id = ?'
    ).bind(role_id, user_id).run()
  } else {
    await db.prepare(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)'
    ).bind(user_id, role_id).run()
  }

  return c.json({ message: 'Role updated successfully' })
})

// DELETE /api/users/:id -> delete user
app.delete('/users/:id', async (c) => {
  const db = c.env.DB
  const user_id = parseInt(c.req.param('id'))

  await db.prepare('DELETE FROM users WHERE user_id = ?').bind(user_id).run()

  return c.json({ message: 'User deleted successfully' })
})

export default app
