import { Hono } from 'hono'

type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// GET /api/users -> list all users with roles
app.get('/users', async (c) => {
  const db = c.env.DB
  const res = await db.prepare(`
    SELECT u.user_id, u.user_name, u.email, r.role_name AS role
    FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.u_id
    LEFT JOIN roles r ON ur.r_id = r.role_id;
  `).all()

  return c.json(res.results)
})

// GET /api/roles -> list all roles
app.get('/roles', async (c) => {
  const db = c.env.DB
  const res = await db.prepare(`
    Select * from roles
    `).all()

  return c.json(res.results)
})

// PUT /users/${userId}/role -> UPDATE ROLE
app.put('/users/:id/role', async (c) => {
  const userId = c.req.param('id')
  const { role } = await c.req.json();

  const updateResult = await c.env.DB.prepare(`
      UPDATE user_roles 
      Set r_id = ?
      WHERE u_id = ? 
    `).bind(role, userId).run();

  if (updateResult.meta.changes === 0) {
    await c.env.DB.prepare(`
        INSERT INTO user_roles (u_id, r_id) VALUES (?, ?)
      `).bind(userId, role).run();
  }

  return c.json({ message: 'Updated' });
})

export default app
