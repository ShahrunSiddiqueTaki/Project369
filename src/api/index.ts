import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/*', cors())


app.get('/', (c) => c.text('Project 369 ERP API is Running!'))

// ================= 1. PARTNERS API =================
app.get('/api/partners', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM partners").all();
  return c.json(results);
})

app.post('/api/partners', async (c) => {
  const { name, mobile, address, partner_type } = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO partners (name, mobile, address, partner_type) VALUES (?, ?, ?, ?)"
  ).bind(name, mobile, address, partner_type).run();
  return c.json({ success: true, message: 'Partner Created' });
})

// ================= 2. PRODUCTS API =================
app.get('/api/products', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM products").all();
  return c.json(results);
})

app.post('/api/products', async (c) => {
  const { name, description, unit, sale_price, purchase_price, stock } = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO products (name, description, unit, sale_price, purchase_price, stock) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(name, description, unit, sale_price, purchase_price, stock).run();
  return c.json({ success: true, message: 'Product Created' });
})

// ================= 3. SALES ORDER API =================
// সেল অর্ডার লিস্ট দেখা
app.get('/api/sales', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT s.*, p.name as partner_name 
    FROM sales_orders s 
    JOIN partners p ON s.partner_id = p.id
  `).all();
  return c.json(results);
})

// সেল অর্ডার সেভ করা (অর্ডার + আইটেমস + স্টক আপডেট)
app.post('/api/sales', async (c) => {
  const { partner_id, items, total_amount } = await c.req.json(); 
  // items format: [{product_id: 1, quantity: 2, unit_price: 500, subtotal: 1000}]

  // ১. অর্ডার হেডার তৈরি
  const orderResult = await c.env.DB.prepare(
    "INSERT INTO sales_orders (partner_id, total_amount, status) VALUES (?, ?, ?)"
  ).bind(partner_id, total_amount, 'Confirmed').run();
  
  const orderId = orderResult.meta.last_row_id;

  // ২. ব্যাচ প্রসেসিং (আইটেম সেভ এবং স্টক কমানো)
  const queries = [];
  for (const item of items) {
    // আইটেম টেবিলে ডাটা ইনসার্ট
    queries.push(
      c.env.DB.prepare(
        "INSERT INTO order_items (order_type, order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind('Sale', orderId, item.product_id, item.quantity, item.unit_price, item.subtotal)
    );
    // স্টক থেকে আইটেম কমানো
    queries.push(
      c.env.DB.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").bind(item.quantity, item.product_id)
    );
  }

  await c.env.DB.batch(queries);
  return c.json({ success: true, order_id: orderId });
})

// ================= 4. PURCHASE ORDER API =================
// পার্চেস অর্ডার লিস্ট দেখা
app.get('/api/purchases', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT po.*, p.name as partner_name 
    FROM purchase_orders po 
    JOIN partners p ON po.partner_id = p.id
  `).all();
  return c.json(results);
})

// পার্চেস অর্ডার সেভ করা (অর্ডার + আইটেমস + স্টক বাড়ানো)
app.post('/api/purchases', async (c) => {
  const { partner_id, items, total_amount } = await c.req.json();

  const orderResult = await c.env.DB.prepare(
    "INSERT INTO purchase_orders (partner_id, total_amount, status) VALUES (?, ?, ?)"
  ).bind(partner_id, total_amount, 'Confirmed').run();
  
  const orderId = orderResult.meta.last_row_id;

  const queries = [];
  for (const item of items) {
    queries.push(
      c.env.DB.prepare(
        "INSERT INTO order_items (order_type, order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind('Purchase', orderId, item.product_id, item.quantity, item.unit_price, item.subtotal)
    );
    // পার্চেস করলে স্টক বাড়ানো
    queries.push(
      c.env.DB.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").bind(item.quantity, item.product_id)
    );
  }

  await c.env.DB.batch(queries);
  return c.json({ success: true, order_id: orderId });
})

export default app